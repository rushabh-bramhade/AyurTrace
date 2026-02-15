
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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testRegistration() {
  const testEmail = `error_test_${Date.now()}@example.com`;
  console.log(`\x1b[36mTesting registration for: ${testEmail}\x1b[0m`);
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: {
      data: {
        name: 'Error Tester',
        role: 'customer'
      }
    }
  });

  if (error) {
    console.log('\x1b[31mRegistration Failed!\x1b[0m');
    console.log('Error Message:', error.message);
    console.log('Full Error Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('\x1b[32mRegistration Successful (Initial Call)\x1b[0m');
    console.log('User ID:', data.user?.id);
    console.log('User Status:', data.user?.identities?.length > 0 ? 'Created' : 'Already exists/Rate limited');
  }
}

testRegistration();
