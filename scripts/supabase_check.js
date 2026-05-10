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
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase vars missing in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    console.log('Testing SELECT on products...');
    const { data: products, error: prodErr } = await supabase.from('products').select('*').limit(5);
    if (prodErr) {
      console.error('Products select error:', prodErr.message || prodErr);
    } else {
      console.log('Products sample:', products);
    }

    console.log('\nTesting INSERT on products (dry run)...');
    const testProduct = { name: 'TEST PROD', price: 1.23, category: 'Test', description: 'Test', image_url: '', stock: 1 };
    const { data: insertData, error: insertErr } = await supabase.from('products').insert([testProduct]).select();
    if (insertErr) {
      console.error('Products insert error:', insertErr.message || insertErr);
    } else {
      console.log('Insert succeeded:', insertData);
      // cleanup
      const id = insertData[0].id;
      console.log('Deleting test product id', id);
      const { error: delErr } = await supabase.from('products').delete().eq('id', id);
      if (delErr) console.error('Delete after insert error:', delErr.message || delErr);
      else console.log('Cleanup delete succeeded');
    }

    console.log('\nTesting SELECT on inquiries...');
    const { data: inquiries, error: inqErr } = await supabase.from('inquiries').select('*').limit(5);
    if (inqErr) {
      console.error('Inquiries select error:', inqErr.message || inqErr);
    } else {
      console.log('Inquiries sample:', inquiries);
    }

    console.log('\nTesting DELETE on inquiries (attempt delete id=-1)...');
    const { error: delInqErr } = await supabase.from('inquiries').delete().eq('id', -1);
    if (delInqErr) console.error('Inquiries delete error:', delInqErr.message || delInqErr);
    else console.log('Inquiries delete succeeded (unexpected)');

  } catch (err) {
    console.error('Unexpected error:', err.message || err);
  }
})();
