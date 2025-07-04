
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { Resend } from 'npm:resend@3.2.0'

// Make sure your RESEND_API_KEY is set in your Supabase project's secrets
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationEmailRequest {
  tenantEmail: string;
  tenantName: string;
  propertyTitle: string;
  invitationLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tenantEmail, tenantName, propertyTitle, invitationLink }: InvitationEmailRequest = await req.json()

    if (!tenantEmail || !tenantName || !propertyTitle || !invitationLink) {
        return new Response(JSON.stringify({ error: 'Missing required fields for email.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
    }

    console.log(`Sending invitation to ${tenantEmail} for property ${propertyTitle}`);

    const { data, error } = await resend.emails.send({
      from: 'XTENT <onboarding@resend.dev>',
      to: [tenantEmail],
      subject: `You're invited to manage your tenancy for ${propertyTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #28a745;">Hello ${tenantName},</h1>
          <p>You have been invited to join XTENT to manage your tenancy for the property: <strong>${propertyTitle}</strong>.</p>
          <p>Please click the link below to accept your invitation and set up your account. This link will expire in 7 days.</p>
          <a href="${invitationLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
          <p style="margin-top: 20px;">If you were not expecting this invitation, you can safely ignore this email.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>The XTENT Team</strong></p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend API error:', error);
      const errorMessage = (error as any)?.message || 'Failed to send email via Resend.';
      const errorName = (error as any)?.name || 'unknown_error';
      return new Response(JSON.stringify({ 
        error: {
          type: 'resend_error',
          name: errorName,
          message: errorMessage,
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ message: 'Email sent successfully', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Error in send-invitation-email function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

serve(handler)
