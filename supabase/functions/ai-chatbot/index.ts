
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Define website knowledge base - this helps the AI understand your site
const websiteKnowledge = `
MOKMzansi Books is a comprehensive business management platform with the following key features:

1. Dashboard - Overview of business metrics and quick access to all features
2. Clients - Client management and tracking
3. Invoices & Quotes - Creation and management of invoices and quotes
4. Accounting - Financial tracking, chart of accounts, journal entries, bank reconciliation
5. HR & Payroll - Employee management, payroll, attendance, leaves, benefits
6. Inventory - Stock and product management
7. Reports - Financial and business reporting
8. Settings - System configuration

The platform supports multiple currencies and languages. Users can sign up for a free trial
and access all features through the dashboard after signing in.
`;

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
    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, the AI assistant is currently unavailable. Please contact support on WhatsApp for assistance."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, chatHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing message parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: `You are MOKMzansi AI Assistant, a helpful assistant for the MOKMzansi Books platform. 
      Answer user questions based on the following information about the website:
      
      ${websiteKnowledge}
      
      Always be helpful, concise, and accurate. If you don't know something, admit it and suggest the user contact support.
      Don't make up features that don't exist in the description above.` },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return new Response(
          JSON.stringify({ 
            response: "I'm sorry, I'm having trouble thinking right now. Please try again later or contact support for assistance."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const aiResponse = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('OpenAI API fetch error:', error);
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later or contact support for assistance."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in AI chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, something went wrong with the AI assistant. Please try again later or contact support for assistance."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
