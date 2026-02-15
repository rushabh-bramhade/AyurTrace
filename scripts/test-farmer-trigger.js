
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
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testFarmerTrigger() {
  const testEmail = `farmer_trigger_${Date.now()}@example.com`;
  console.log(`\x1b[36mTesting Trigger with FARMER role: ${testEmail}\x1b[0m`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Farmer Trigger Test', role: 'farmer' }
  });

  if (error) {
    console.log('\x1b[31mAdmin User Creation Failed!\x1b[0m');
    console.log('Error:', error.message);
  } else {
    console.log('\x1b[32mUser created via Admin API.\x1b[0m');
    const userId = data.user.id;
    
    // Check profile
    const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    // Check role
    const { data: role, error: rError } = await supabase.from('user_roles').select('*').eq('user_id', userId).maybeSingle();

    if (pError) console.error('Profile Fetch Error:', pError.message);
    if (rError) console.error('Role Fetch Error:', rError.message);

    if (profile && role && role.role === 'farmer') {
      console.log('\x1b[32mSUCCESS: Farmer profile and role created correctly by trigger.\x1b[0m');
    } else {
      console.log('\x1b[31mFAILURE: Trigger did not create farmer role correctly.\x1b[0m');
      console.log('Profile:', profile);
      console.log('Role:', role);
    }
    
    // Cleanup
    await supabase.auth.admin.deleteUser(userId);
  }
}

testFarmerTrigger();
