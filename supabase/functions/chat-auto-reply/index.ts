import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conversation_id, visitor_message } = await req.json();
    if (!conversation_id || !visitor_message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Recent history window for context
    const { data: history } = await supabase
      .from("chat_messages")
      .select("sender_type, message")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false })
      .limit(12);

    const recent = (history || []).reverse();

    const SYSTEM_PROMPT = `You are Morgan, a senior client advisor at MorganFinance Bank — part product expert, part trusted consultant. You speak like a top-performing human relationship manager: warm, confident, consultative, never robotic or pushy.

WHAT WE OFFER (know these cold):
- Personal Banking: checking & savings, instant internal transfers, international SWIFT/BIC wires, card & wallet deposits, withdrawals.
- Business Banking: business accounts, payroll and vendor payments, multi-currency, higher limits.
- Loans: personal, business, and crypto-collateralized loans. Fixed monthly terms, transparent interest, disbursed straight to the account balance once approved. Crypto collateral (BTC/ETH/USDT) lets a client borrow cash WITHOUT selling their crypto, so they keep upside exposure.
- Crypto: BTC, ETH, USDT balances with live pricing, usable as loan collateral.
- Security: bank-grade encryption, admin-reviewed transactions, real-time alerts, PWA app with push notifications.

HOW TO ADVISE:
1. Diagnose first. If the goal is unclear, ask ONE sharp qualifying question (amount, timeline, purpose, currency).
2. Recommend ONE best-fit product and say plainly why it beats the alternatives for their situation.
3. Justify with concrete value: what problem it solves, how it works step by step, what it costs/what they keep, and the risk they avoid.
4. Handle objections honestly — mention real trade-offs (e.g. crypto collateral can be topped up if prices drop). Honesty builds trust and closes better than hype.
5. Close with one clear next step ("Open Loans > Apply and pick crypto collateral — takes about 2 minutes").

STYLE:
- Depth when it helps the decision, brevity when it doesn't. Typically 3-6 sentences; use short bullet lists for comparisons, features, or steps.
- Confident and specific. No filler, no repeated disclaimers, no invented rates, fees, or promises. If a number isn't known, describe how it's determined instead of guessing.
- Never request passwords, PINs, card numbers, or full account details.
- For account-specific actions or disputes: "A human agent will follow up shortly."`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recent.map((m: any) => ({
        role: m.sender_type === "visitor" ? "user" : "assistant",
        content: (m.message || "").slice(0, 800),
      })),
    ];

    // Fast-fail upstream timeout (30s) — client retries if exceeded
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 30_000);
    // Abort upstream when client disconnects
    req.signal.addEventListener("abort", () => upstreamController.abort());

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages,
        stream: true,
        max_tokens: 600,
        temperature: 0.6,
        top_p: 0.95,
      }),
      signal: upstreamController.signal,
    }).finally(() => clearTimeout(upstreamTimeout));


    if (!aiResponse.ok || !aiResponse.body) {
      const errText = await aiResponse.text().catch(() => "");
      console.error("AI gateway error:", aiResponse.status, errText);
      const fallback = "Thank you for your message! Our support team is currently unavailable. We'll get back to you as soon as possible. For urgent matters, please email support@morganfinance.com.";
      await supabase.from("chat_messages").insert({
        conversation_id,
        sender_type: "admin",
        sender_id: "ai-assistant",
        message: fallback,
        is_read: true,
      });
      // Stream the fallback as a single SSE event so the client UI behaves consistently
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ delta: fallback })}\n\n`));
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    let fullText = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body!.getReader();
        let buffer = "";

        // Heartbeat: send an SSE comment every 10s so the connection
        // never appears idle to proxies or the browser.
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch {
            // controller already closed
          }
        }, 10_000);

        // Stall watchdog: if no upstream bytes for 25s, abort and let
        // the client retry rather than hang forever.
        let lastChunkAt = Date.now();
        const watchdog = setInterval(() => {
          if (Date.now() - lastChunkAt > 25_000) {
            console.warn("Upstream stalled, aborting");
            upstreamController.abort();
          }
        }, 5_000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lastChunkAt = Date.now();
            buffer += decoder.decode(value, { stream: true });

            // Parse SSE lines
            let nlIdx;
            while ((nlIdx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, nlIdx).trim();
              buffer = buffer.slice(nlIdx + 1);
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                }
              } catch {
                // ignore parse errors on keep-alive lines
              }
            }
          }
        } catch (err) {
          console.error("stream read error", err);
        } finally {
          clearInterval(heartbeat);
          clearInterval(watchdog);
        }

        // Persist the completed assistant message
        const finalText = fullText || "Thank you for reaching out! A support agent will be with you shortly.";
        await supabase.from("chat_messages").insert({
          conversation_id,
          sender_type: "admin",
          sender_id: "ai-assistant",
          message: finalText,
          is_read: true,
        });

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("chat-auto-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
