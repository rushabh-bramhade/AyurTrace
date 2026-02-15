
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

async function checkSchema() {
  console.log('--- Checking Tables ---');
  // Check tables via RPC or direct query if possible, but let's try just listing some rows
  const tables = ['profiles', 'user_roles', 'herb_batches'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`Table '${table}': OK (Rows found: ${data.length > 0 ? 'Yes' : 'No'})`);
    }
  }

  console.log('\n--- Checking User Status (rushabh@gmail.com) ---');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  const testUser = users?.find(u => u.email === 'rushabh@gmail.com');
  
  if (testUser) {
    console.log(`Auth User ID: ${testUser.id}`);
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', testUser.id).maybeSingle();
    const { data: role } = await supabase.from('user_roles').select('*').eq('user_id', testUser.id).maybeSingle();
    console.log('Profile Data:', profile);
    console.log('Role Data:', role);
  } else {
    console.log('Test user rushabh@gmail.com not found.');
  }
}

checkSchema();
