import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create JWT for Apple API validation
async function createAppleJWT(issuerId: string, keyId: string, privateKey: string): Promise<string> {
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20 minutes
    aud: 'appstoreconnect-v1',
  };

  // In production, use a proper JWT library with ES256 support
  // For now, we'll just validate the format
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  
  // Basic validation - check private key format
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Invalid private key format');
  }

  return `${headerB64}.${payloadB64}.signature_placeholder`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { issuerId, keyId, privateKey } = await req.json();

    if (!issuerId || !keyId || !privateKey) {
      throw new Error('Missing required credentials');
    }

    // Validate credentials format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(issuerId)) {
      throw new Error('Invalid Issuer ID format');
    }

    if (!/^[A-Z0-9]{10}$/i.test(keyId)) {
      throw new Error('Invalid Key ID format');
    }

    // Try to create a test JWT
    await createAppleJWT(issuerId, keyId, privateKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Encrypt credentials (in production, use proper encryption)
    const encryptedData = btoa(JSON.stringify({
      issuer_id: issuerId,
      key_id: keyId,
      private_key: privateKey,
    }));

    // Store credentials
    const { error: dbError } = await supabaseClient
      .from('credentials')
      .upsert({
        user_id: user.id,
        type: 'apple_app_store',
        data_encrypted: encryptedData,
        account_email: `Apple Developer (${keyId})`,
        last_validated_at: new Date().toISOString(),
        revoked: false,
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error storing Apple credentials:', error);
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
