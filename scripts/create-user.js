
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
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
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password, name, role) {
  console.log(`Attempting to create user: ${email} with role: ${role}`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });
  
  if (error) {
    console.error('Error creating user:', error.message);
    if (error.message.includes('already registered')) {
      console.log('User already exists. Attempting to update instead...');
      // If user exists, we can't easily find ID here without listing, but let's just stop
    }
    return;
  }
  
  console.log(`Successfully created user: ${email}`);
  console.log(`User ID: ${data.user.id}`);
  console.log('User is pre-confirmed. You can log in now.');
}

const email = process.argv[2] || 'rushabh@gmail.com';
const password = process.argv[3] || '12345678';
const name = process.argv[4] || 'Rushabh';
const role = process.argv[5] || 'farmer';

createUser(email, password, name, role);
