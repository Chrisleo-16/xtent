
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, name, password } = await req.json()
    if (!token || !name || !password) {
      return new Response(JSON.stringify({ error: 'Token, name, and password are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create a Supabase admin client with the service role key for all operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        }
      }
    )

    // 1. Fetch and validate the invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('tenant_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (invError || !invitation) {
      throw new Error('Invitation not found or invalid.')
    }
    if (invitation.status !== 'pending') {
      throw new Error('This invitation has already been used or expired.')
    }
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('This invitation has expired.')
    }

    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('monthly_rent')
      .eq('id', invitation.property_id)
      .single()

    if (propertyError || !property) {
      throw new Error('Could not load property details for this invitation.')
    }

    // 2. Create the user using admin client (this ensures user is created in auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      user_metadata: { 
        name: name, 
        role: 'tenant' 
      },
      email_confirm: true // Auto-confirm email since this is an invitation flow
    })

    if (authError) {
      // If user already exists, try to get their data
      if (authError.message.includes('already registered')) {
        const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(invitation.email)
        if (getUserError || !existingUser.user) {
          throw new Error('User already exists but could not retrieve user data.')
        }
        authData.user = existingUser.user
      } else {
        throw authError
      }
    }

    if (!authData.user) {
      throw new Error('Failed to create or retrieve user account.')
    }

    const user = authData.user
    console.log('User created/retrieved successfully:', user.id)

    // 3. Create or update the profile using admin client
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: invitation.email,
        name: name,
        role: 'tenant',
        verification_status: 'unverified'
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Failed to create profile:', profileError)
      throw new Error('Failed to create user profile. Please contact support.')
    }

    console.log('Profile created successfully for user:', user.id)

    // 4. Create the lease for the tenant
    const leaseStartDate = new Date()
    const leaseEndDate = new Date()
    leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1)

    const { data: newLease, error: leaseError } = await supabaseAdmin.from('leases').insert({
        property_id: invitation.property_id,
        tenant_id: user.id,
        landlord_id: invitation.landlord_id,
        monthly_rent: property.monthly_rent,
        deposit_amount: property.monthly_rent,
        start_date: leaseStartDate.toISOString().split('T')[0],
        end_date: leaseEndDate.toISOString().split('T')[0],
        status: 'active',
    }).select().single()

    if (leaseError) {
      console.error('Failed to create lease:', leaseError)
      throw new Error('Your account was created, but we failed to set up your lease. Please contact your landlord.')
    }

    console.log('Lease created successfully:', newLease.id)

    // 5. Update the invitation to mark it as accepted
    const { error: updateError } = await supabaseAdmin
      .from('tenant_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: user.id,
        lease_id: newLease.id,
      })
      .eq('id', invitation.id)
    
    if (updateError) {
      console.error('Failed to update invitation status:', updateError)
    }

    // 6. Generate a session for the user to automatically log them in
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: {
        redirectTo: `${req.headers.get('origin')}/tenant-dashboard`
      }
    })

    if (sessionError) {
      console.error('Failed to generate session:', sessionError)
      // Still return success since account was created
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Account created successfully. Please login manually.',
        user: { id: user.id, email: user.email }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Return success with login link
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account created successfully.',
      user: { id: user.id, email: user.email },
      loginUrl: sessionData.properties?.action_link
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
