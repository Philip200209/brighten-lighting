const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).filter(Boolean);
const vars = {};
for (const line of env) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) vars[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = vars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = vars.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = (vars.VITE_ADMIN_EMAIL || 'info@brightenlighting.com').toLowerCase();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase vars missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    console.log(`\nChecking for admin profile with email: ${ADMIN_EMAIL}`);
    
    // Get all users to find the admin
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
    if (usersErr) {
      console.error('Cannot list users (need service role key). Skipping auth check.');
    } else {
      const adminUser = users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL);
      if (adminUser) {
        console.log(`Found admin user: ${adminUser.id}`);
        
        // Check if profile exists
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adminUser.id)
          .single();
        
        if (profileErr && profileErr.code === 'PGRST116') {
          // Profile doesn't exist
          console.log(`No profile found for admin user. Creating one...`);
          const { data: newProfile, error: insertErr } = await supabase
            .from('profiles')
            .insert([{
              id: adminUser.id,
              username: ADMIN_EMAIL.split('@')[0],
              email: ADMIN_EMAIL,
              role: 'admin'
            }])
            .select();
          if (insertErr) {
            console.error('Failed to create profile:', insertErr.message);
          } else {
            console.log('Profile created successfully:', newProfile);
          }
        } else if (profileErr) {
          console.error('Error checking profile:', profileErr.message);
        } else {
          console.log('Profile exists:', profile);
          if (profile.role !== 'admin') {
            console.log('Profile role is not admin, updating...');
            const { data: updated, error: updateErr } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', adminUser.id)
              .select();
            if (updateErr) {
              console.error('Failed to update role:', updateErr.message);
            } else {
              console.log('Role updated to admin:', updated);
            }
          }
        }
      } else {
        console.log(`Admin user with email ${ADMIN_EMAIL} not found in auth.users`);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
