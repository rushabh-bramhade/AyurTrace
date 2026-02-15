
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

async function registerBypass(email, password, name, role) {
  console.log(`\x1b[36m--- Supabase Registration Bypass ---\x1b[0m`);
  console.log(`Creating user: ${email} (${role})`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log(`\x1b[33mNote: User ${email} already exists in Auth.\x1b[0m`);
      // Try to ensure they have the right profile/role even if already in Auth
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        console.log(`Updating existing user profile for ${existingUser.id}...`);
        // The trigger 'handle_new_user' might not have run for them if they were created manually before
        await supabase.from('profiles').upsert({ user_id: existingUser.id, name, email }).select();
        await supabase.from('user_roles').upsert({ user_id: existingUser.id, role }).select();
      }
    } else {
      console.error(`\x1b[31mError:\x1b[0m`, error.message);
      return;
    }
  }

  console.log(`\x1b[32mSUCCESS!\x1b[0m User is ready for immediate login.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${role}`);
}

const args = process.argv.slice(2);
if (args.length < 4) {
  console.log(`Usage: node scripts/register-bypass.js <email> <password> <name> <role>`);
  console.log(`Example: node scripts/register-bypass.js test@user.com 12345678 "Test User" customer`);
} else {
  registerBypass(args[0], args[1], args[2], args[3]);
}
