
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminRegistration() {
  console.log('--- Testing Admin User Creation (Trigger Check) ---');
  const email = `trigger_test_${Date.now()}@example.com`;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Trigger Test', role: 'customer' }
  });

  if (error) {
    console.error('Admin Registration Error:', error.message);
    if (error.message.includes('trigger')) {
      console.log('CONFIRMED: The handle_new_user trigger is failing.');
    }
  } else {
    console.log('Admin Registration Success:', data.user.id);
    // Now check if profile/role were created
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).maybeSingle();
    const { data: role } = await supabase.from('user_roles').select('*').eq('user_id', data.user.id).maybeSingle();
    
    if (!profile || !role) {
      console.log('WARNING: User created but profile or role is missing. Trigger might be partially working or tables are missing.');
    } else {
      console.log('SUCCESS: Profile and role created correctly.');
    }
    
    // Cleanup
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}

testAdminRegistration();
