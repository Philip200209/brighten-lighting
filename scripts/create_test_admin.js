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

  const timestamp = Date.now();
  const email = process.env.TEST_EMAIL || `testadmin${timestamp}@example.com`;
  const username = process.env.TEST_USERNAME || `testadmin${timestamp}`;
  const password = process.env.TEST_PASSWORD || `TestPass!${Math.floor(Math.random()*9000)+1000}`;

  console.log('Creating test admin:', { email, username });

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Sign up error:', error);
      process.exit(1);
    }

    const user = data?.user || data?.data?.user;
    console.log('Sign up response:', data);

    // Try to fetch current session/user
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || user;
    console.log('Current user after signup:', currentUser?.id);

    // Insert profile if we have user id
    if (currentUser?.id) {
      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert([{ id: currentUser.id, username, email, role: 'admin' }])
        .select();
      if (insertErr) {
        console.error('Insert profile error:', insertErr);
        process.exit(1);
      }
      console.log('Inserted profile:', inserted);
    } else {
      console.log('No active session; profile not inserted. You may need to confirm email in Supabase or use service role key.');
    }

    console.log('Done. Keep the following test credentials for login:');
    console.log('email:', email);
    console.log('password:', password);
    console.log('username:', username);
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
})();
