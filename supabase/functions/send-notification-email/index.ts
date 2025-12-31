import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'transaction_created' | 'transaction_status_changed' | 'role_changed';
  userId: string;
  data: {
    transactionId?: string;
    transactionType?: string;
    amount?: number;
    currency?: string;
    status?: string;
    oldStatus?: string;
    newRole?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(
        JSON.stringify({ message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { type, userId, data }: NotificationRequest = await req.json();

    // Get user email from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject = "";
    let htmlContent = "";
    const userName = profile.full_name || "Valued Customer";

    switch (type) {
      case 'transaction_created':
        subject = `New Transaction: ${data.transactionType} - ${data.currency} ${data.amount}`;
        htmlContent = `
          <h1>Transaction Created</h1>
          <p>Hello ${userName},</p>
          <p>A new transaction has been created on your account:</p>
          <ul>
            <li><strong>Type:</strong> ${data.transactionType}</li>
            <li><strong>Amount:</strong> ${data.currency} ${data.amount}</li>
            <li><strong>Status:</strong> ${data.status}</li>
          </ul>
          <p>If you did not authorize this transaction, please contact support immediately.</p>
          <p>Best regards,<br>The Banking Team</p>
        `;
        break;

      case 'transaction_status_changed':
        subject = `Transaction Status Updated: ${data.oldStatus} → ${data.status}`;
        htmlContent = `
          <h1>Transaction Status Updated</h1>
          <p>Hello ${userName},</p>
          <p>Your transaction status has been updated:</p>
          <ul>
            <li><strong>Previous Status:</strong> ${data.oldStatus}</li>
            <li><strong>New Status:</strong> ${data.status}</li>
            <li><strong>Amount:</strong> ${data.currency} ${data.amount}</li>
          </ul>
          <p>Best regards,<br>The Banking Team</p>
        `;
        break;

      case 'role_changed':
        subject = `Account Role Updated: ${data.newRole}`;
        htmlContent = `
          <h1>Account Role Changed</h1>
          <p>Hello ${userName},</p>
          <p>Your account role has been updated to: <strong>${data.newRole}</strong></p>
          <p>If you have any questions about this change, please contact support.</p>
          <p>Best regards,<br>The Banking Team</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Banking <onboarding@resend.dev>",
      to: [profile.email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
