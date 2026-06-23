import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Small history window for low latency
    const { data: history } = await supabase
      .from("chat_messages")
      .select("sender_type, message")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false })
      .limit(8);

    const recent = (history || []).reverse();

    const messages = [
      {
        role: "system",
        content: `You are MorganFinance's AI support assistant. Answer banking questions (accounts, transfers, deposits, withdrawals, loans, crypto) briefly and clearly. Keep replies under 3 short sentences. If a request needs human help, say a human agent will follow up. Never share sensitive info.`,
      },
      ...recent.map((m: any) => ({
        role: m.sender_type === "visitor" ? "user" : "assistant",
        content: (m.message || "").slice(0, 600),
      })),
    ];

    // Overall upstream timeout (45s) so we never hang forever
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 45_000);
    // Abort upstream when client disconnects
    req.signal.addEventListener("abort", () => upstreamController.abort());

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages,
        stream: true,
        max_tokens: 220,
        temperature: 0.4,
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

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
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
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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
