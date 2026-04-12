import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get recent conversation history for context
    const { data: history } = await supabase
      .from("chat_messages")
      .select("sender_type, message")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      {
        role: "system",
        content: `You are MorganFinance's friendly AI support assistant. You help customers with banking questions about accounts, transfers, deposits, withdrawals, loans, and crypto services. Be concise, helpful, and professional. If a question requires human assistance (e.g. account-specific actions, disputes, complex issues), let the user know that a human agent will follow up soon. Never share sensitive information or make promises about specific financial outcomes.`,
      },
      ...(history || []).map((m: any) => ({
        role: m.sender_type === "visitor" ? "user" : "assistant",
        content: m.message,
      })),
    ];

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      // Fallback message
      const fallback = "Thank you for your message! Our support team is currently unavailable. We'll get back to you as soon as possible. For urgent matters, please email support@morganfinance.com.";
      await supabase.from("chat_messages").insert({
        conversation_id,
        sender_type: "admin",
        sender_id: "ai-assistant",
        message: fallback,
        is_read: true,
      });
      return new Response(JSON.stringify({ reply: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Thank you for reaching out! A support agent will be with you shortly.";

    // Insert AI reply as admin message
    await supabase.from("chat_messages").insert({
      conversation_id,
      sender_type: "admin",
      sender_id: "ai-assistant",
      message: reply,
      is_read: true,
    });

    return new Response(JSON.stringify({ reply, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-auto-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
