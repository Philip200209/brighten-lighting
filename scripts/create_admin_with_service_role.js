import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

async function loadEnv() {
  const raw = await fs.readFile(new URL('../.env', import.meta.url));
  const text = raw.toString();
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^=#]+)=(.+)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

(async () => {
  const env = await loadEnv();
  const SUPABASE_URL = env.VITE_SUPABASE_URL;
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = process.env.TEST_EMAIL || process.argv[2];
  const password = process.env.TEST_PASSWORD || process.argv[3] || 'TempPass!2345';
  const username = process.env.TEST_USERNAME || `admin_${Date.now()}`;
  const fullName = process.env.TEST_FULL_NAME || 'Brighten Admin';

  if (!email) {
    console.error('Usage: node scripts/create_admin_with_service_role.js <email> [password]');
    process.exit(1);
  }

  console.log('Creating admin user:', { email, username });

  let userId;
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Auth listUsers error:', listError);
    process.exit(1);
  }

  const existingUser = listData?.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
    const { error: updateUserError } = await supabase.auth.admin.updateUserById(userId, {
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName },
    });
    if (updateUserError) {
      console.error('Auth updateUserById error:', updateUserError);
      process.exit(1);
    }
    console.log('Updated existing auth user:', userId);
  } else {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName },
    });

    if (userError) {
      console.error('Auth createUser error:', userError);
      process.exit(1);
    }

    userId = userData?.user?.id;
    if (!userId) {
      console.error('No user id returned from Supabase');
      process.exit(1);
    }
    console.log('Created new auth user:', userId);
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      [{ id: userId, username, email, full_name: fullName, role: 'admin' }],
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (profileError) {
    if (profileError.code === 'PGRST205' || /schema cache/i.test(profileError.message || '')) {
      console.error('\nThe public.profiles table is missing in Supabase.');
      console.error('Create it first using the SQL in AUTH_SETUP.md, then re-run this command.\n');
    }
    console.error('Profile upsert error:', profileError);
    process.exit(1);
  }

  console.log('Created/updated profile:', profileData);
  console.log('Login credentials:');
  console.log('email:', email);
  console.log('username:', username);
  console.log('password:', password);
})();
