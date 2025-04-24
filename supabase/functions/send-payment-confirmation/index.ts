
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount } = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MOKMzansi <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for your subscription!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank You for Subscribing!</h1>
          <p>We're excited to have you as a premium member of MOKMzansi Books.</p>
          <p>Your payment of R${amount} has been successfully processed.</p>
          <p>You now have access to all premium features including:</p>
          <ul>
            <li>Exclusive content</li>
            <li>Premium support</li>
            <li>Advanced features</li>
          </ul>
          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
          <p>Best regards,<br>The MOKMzansi Team</p>
        </div>
      `,
    });

    console.log("Payment confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
