import { createClient } from '@supabase/supabase-js';
import { testAccounts } from '../data/testAccounts';

// Create a Supabase client with the service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function createTestAccount(role: string, account: any) {
  try {
    // Create auth user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true
    });

    if (authError || !authData.user) {
      console.error(`❌ Failed to create ${role} auth account:`, authError);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: account.email,
        name: account.name,
        type: account.role
      });

    if (profileError) {
      console.error(`❌ Failed to create ${role} profile:`, profileError);
      return;
    }

    // Create collector profile if needed
    if (account.role === 'collector') {
      const { error: collectorError } = await supabase
        .from('collectors')
        .insert({
          id: authData.user.id,
          vehicle_type: 'van',
          vehicle_capacity_volume: 12,
          vehicle_capacity_weight: 1500,
          vehicle_license_plate: 'TEST123',
          supported_waste_types: ['furniture', 'appliances', 'electronics', 'household'],
          rating: 4.8,
          completed_jobs: 42
        });

      if (collectorError) {
        console.error('❌ Failed to create collector profile:', collectorError);
        return;
      }
    }

    console.log(`✅ Successfully created ${role} account:`, account.email);
  } catch (error) {
    console.error(`❌ Error creating ${role} account:`, error);
  }
}

// This function should be run manually, not on app startup
export async function createTestAccounts() {
  console.log('Creating test accounts...');
  
  for (const [role, account] of Object.entries(testAccounts)) {
    await createTestAccount(role, account);
  }
  
  console.log('Test account creation completed');
}