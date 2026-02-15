
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
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY; // Use Anon key to simulate frontend

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration(email, role) {
  console.log(`--- Testing Frontend Registration Simulation for ${email} (${role}) ---`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        name: 'Test User',
        role: role
      }
    }
  });

  if (error) {
    console.error('Registration Error:', error.message);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
  } else {
    console.log('Registration Success (Initial):', data.user?.email);
    console.log('User Status:', data.user?.identities?.length > 0 ? 'User created' : 'User already exists/Check email');
  }
}

const randomEmail = `test_${Math.floor(Math.random() * 100000)}@example.com`;
testRegistration(randomEmail, 'farmer');
