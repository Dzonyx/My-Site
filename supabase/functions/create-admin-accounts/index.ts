import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const ownerAccounts = [
      { email: 'nidza.radovic2012@gmail.com', password: 'Nikolapro1!' },
      { email: 'nocodebuilder@hotmail.com', password: 'Nikolapro1!' }
    ];

    const results = [];

    for (const account of ownerAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === account.email);

      let userId: string;

      if (existingUser) {
        console.log(`User ${account.email} already exists`);
        userId = existingUser.id;
        
        // Update password
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: account.password
        });
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true
        });

        if (createError) {
          console.error(`Error creating user ${account.email}:`, createError);
          throw createError;
        }

        userId = newUser.user.id;
        console.log(`Created user ${account.email}`);
      }

      // Check if owner role already assigned
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'owner')
        .maybeSingle();

      if (!existingRole) {
        // Assign owner role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'owner'
          });

        if (roleError) {
          console.error(`Error assigning owner role to ${account.email}:`, roleError);
          throw roleError;
        }

        console.log(`Assigned owner role to ${account.email}`);
      } else {
        console.log(`${account.email} already has owner role`);
      }

      results.push({
        email: account.email,
        status: 'success',
        message: existingUser ? 'Updated existing account' : 'Created new account'
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
