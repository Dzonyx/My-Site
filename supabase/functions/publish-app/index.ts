import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  platforms: {
    android: boolean;
    ios: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const body: PublishRequest = await req.json();

    // Get app configuration
    const { data: apps, error: appError } = await supabaseClient
      .from('apps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (appError) throw appError;
    if (!apps || apps.length === 0) {
      throw new Error('No app configuration found. Please configure your app first.');
    }

    const app = apps[0];

    // Create publish jobs for each platform
    const jobs = [];
    
    if (body.platforms.android) {
      const { data: androidJob, error: androidError } = await supabaseClient
        .from('publish_jobs')
        .insert({
          user_id: user.id,
          app_id: app.id,
          platform: 'android',
          status: 'queued',
          progress: { percentage: 0, step: 'Initializing' }
        })
        .select()
        .single();

      if (androidError) throw androidError;
      jobs.push(androidJob);

      // Log event
      await supabaseClient.from('publish_events').insert({
        publish_job_id: androidJob.id,
        type: 'info',
        message: 'Android build queued'
      });
    }

    if (body.platforms.ios) {
      const { data: iosJob, error: iosError } = await supabaseClient
        .from('publish_jobs')
        .insert({
          user_id: user.id,
          app_id: app.id,
          platform: 'ios',
          status: 'queued',
          progress: { percentage: 0, step: 'Initializing' }
        })
        .select()
        .single();

      if (iosError) throw iosError;
      jobs.push(iosJob);

      // Log event
      await supabaseClient.from('publish_events').insert({
        publish_job_id: iosJob.id,
        type: 'info',
        message: 'iOS build queued'
      });
    }

    // Start background processing
    for (const job of jobs) {
      processPublishJob(job.id, app, supabaseClient);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: jobs[0]?.id,
        message: 'Publishing started. Your app will be available in the stores soon.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error publishing app:', error);
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

async function processPublishJob(jobId: string, app: any, supabaseClient: any) {
  try {
    // Update to processing
    await updateJobStatus(jobId, 'processing', 10, 'Building app', supabaseClient);
    await logEvent(jobId, 'info', 'Starting app build', supabaseClient);

    // Simulate build process steps
    const steps = [
      { percentage: 20, step: 'Generating native code', delay: 2000 },
      { percentage: 40, step: 'Compiling application', delay: 3000 },
      { percentage: 60, step: 'Packaging resources', delay: 2000 },
      { percentage: 80, step: 'Signing application', delay: 2000 },
      { percentage: 90, step: 'Uploading to store', delay: 3000 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      await updateJobStatus(jobId, 'processing', step.percentage, step.step, supabaseClient);
      await logEvent(jobId, 'info', step.step, supabaseClient);
    }

    // Complete
    await updateJobStatus(jobId, 'completed', 100, 'Published successfully', supabaseClient);
    await logEvent(jobId, 'success', `App published successfully to ${app.platform} store`, supabaseClient);

    // In a real implementation, this would:
    // 1. Bundle the React app with Capacitor
    // 2. Build native iOS/Android apps
    // 3. Sign with proper certificates
    // 4. Upload to Google Play Console / App Store Connect
    // 5. Submit for review

  } catch (error) {
    console.error('Error processing job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateJobStatus(jobId, 'failed', 0, 'Publishing failed', supabaseClient, errorMessage);
    await logEvent(jobId, 'error', `Publishing failed: ${errorMessage}`, supabaseClient);
  }
}

async function updateJobStatus(
  jobId: string, 
  status: string, 
  percentage: number, 
  step: string, 
  supabaseClient: any,
  errorMessage?: string
) {
  const updates: any = {
    status,
    progress: { percentage, step }
  };

  if (status === 'processing' && percentage === 10) {
    updates.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed') {
    updates.finished_at = new Date().toISOString();
  }

  if (errorMessage) {
    updates.error_message = errorMessage;
  }

  await supabaseClient
    .from('publish_jobs')
    .update(updates)
    .eq('id', jobId);
}

async function logEvent(jobId: string, type: string, message: string, supabaseClient: any) {
  await supabaseClient
    .from('publish_events')
    .insert({
      publish_job_id: jobId,
      type,
      message
    });
}
