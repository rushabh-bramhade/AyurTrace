
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';

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

async function generateHash(data) {
  const sortedKeys = Object.keys(data).sort();
  const canonical = {};
  for (const key of sortedKeys) {
    canonical[key] = data[key];
  }
  const jsonString = JSON.stringify(canonical);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

async function testAddProduct(email) {
  console.log(`--- Testing Product Addition for ${email} ---`);
  
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === email);
  
  if (!user) {
    console.error('User not found.');
    return;
  }

  const farmerId = user.id;
  const batchCode = `TEST-ATB-${Date.now().toString().slice(-6)}`;
  
  const steps = [
    { step: "Harvesting", date: "2026-02-14", description: "Harvested from organic farm" },
    { step: "Drying", date: "2026-02-14", description: "Sun dried for 3 days" }
  ];

  const dataForHash = {
    batchCode,
    herbName: "Test Herb",
    scientificName: "Testus Herbus",
    harvestRegion: "Test Region",
    harvestDate: "2026-02-14",
    farmerId,
    processingSteps: steps.map(s => s.step).join(","),
  };

  const hash = await generateHash(dataForHash);

  const { data, error } = await supabase.from('herb_batches').insert({
    batch_code: batchCode,
    farmer_id: farmerId,
    herb_name: "Test Herb",
    scientific_name: "Testus Herbus",
    description: "This is a test herb batch created by automation.",
    harvest_region: "Test Region",
    harvest_date: "2026-02-14",
    processing_steps: steps,
    price: 150.00,
    unit: "100g",
    hash,
    category: "Roots",
    status: "active",
  }).select();

  if (error) {
    console.error('Error adding product:', error.message);
  } else {
    console.log('Successfully added product:', data[0].batch_code);
  }
}

testAddProduct('newfarmer@example.com');
