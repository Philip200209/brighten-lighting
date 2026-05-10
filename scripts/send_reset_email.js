import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

async function loadEnv() {
  try {
    const raw = await fs.readFile(new URL('../.env', import.meta.url));
    const text = raw.toString();
    const lines = text.split(/\r?\n/);
    const env = {};
    for (const line of lines) {
      const m = line.match(/^([^=#]+)=(.+)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
    return env;
  } catch (e) {
    console.error('Failed to load .env', e);
    process.exit(1);
  }
}

(async () => {
  const env = await loadEnv();
  const SUPABASE_URL = env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL or ANON key missing in .env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const email = process.env.TEST_EMAIL || process.argv[2];
  if (!email) {
    console.error('Usage: node send_reset_email.js <email> or set TEST_EMAIL env var');
    process.exit(1);
  }

  console.log('Sending password reset to:', email);

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/admin/reset-password'
    });
    if (error) {
      console.error('Failed to send reset:', error);
      process.exit(1);
    }
    console.log('Reset request accepted:', data);
    console.log('Check the inbox for the reset link.');
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
})();
