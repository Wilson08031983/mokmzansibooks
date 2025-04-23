
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
  
  try {
    // Get customer details from JWT token
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('No authorization token provided');
    }
    
    const token = authorization.replace('Bearer ', '');
    const { user } = await getUser(token);
    
    if (!user?.email) {
      throw new Error('No user email found');
    }

    // Call Paystack API to generate a manage subscription link
    const response = await fetch('https://api.paystack.co/subscription/manage/link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: user.email,
      }),
    });

    const data = await response.json();
    console.log('Paystack manage subscription link response:', data);
    
    if (!data.status) {
      throw new Error(data.message || 'Failed to generate portal link');
    }
    
    return new Response(JSON.stringify({ url: data.data.link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error generating customer portal link:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate portal link' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to get user from JWT
async function getUser(token: string) {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY as string,
      },
    });
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate user');
    }
    
    const userData = await authResponse.json();
    return { user: userData };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}
