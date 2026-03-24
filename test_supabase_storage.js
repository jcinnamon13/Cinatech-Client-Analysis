require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking buckets...");
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) console.error("Bucket error:", bucketErr);
  
  if (!buckets?.find(b => b.name === 'leads')) {
    console.log("Creating 'leads' bucket...");
    const { error: createErr } = await supabase.storage.createBucket('leads', { public: false });
    if (createErr) console.error("Create bucket error:", createErr);
  }
  
  console.log("Downloading CSV...");
  const { data: fileData, error: downloadError } = await supabase.storage.from('leads').download('client_database_free_report.csv');
  
  let content = `"Timestamp","Full Name","Email","Phone","Website","Business Summary"\n`;
  if (fileData) {
    content = await fileData.text();
    console.log("Existing CSV found.");
  } else {
    console.log("CSV not found, creating new header.");
  }
  
  content += `"2026-03-24T12:00:00.000Z","Test user","test@test.com","123","test.com","Test summary"\n`;
  
  console.log("Uploading CSV...");
  const { data, error } = await supabase.storage.from('leads').upload('client_database_free_report.csv', content, {
    upsert: true,
    contentType: 'text/csv'
  });
  
  console.log('Upload result:', data, error);
}
run();
