import { SupabaseManager } from '../config/supabase.js';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Environment variables check
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing required environment variables');
    console.log('   Please set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    // Test connection
    const supabaseManager = new SupabaseManager({
      url: supabaseUrl,
      key: supabaseKey,
      options: {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    });

    supabaseManager.connect();
    const client = supabaseManager.getClient();

    console.log('\n🔗 Testing Database Connection...');
    
    // Test a simple query
    const { error } = await client
      .from('conversations')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ Database Connection Failed: ${error.message}`);
      console.log('   This might be expected if tables are not yet created');
    } else {
      console.log('✅ Database Connection Successful');
    }

    console.log('\n🎉 Supabase Configuration Test Completed');
    
  } catch (error) {
    console.error('\n❌ Supabase Configuration Test Failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection().catch(console.error);
}

export { testSupabaseConnection };
