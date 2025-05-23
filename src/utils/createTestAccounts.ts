import { supabase } from './supabaseClient';
import { testAccounts } from '../data/testAccounts';

export async function createTestAccounts() {
  for (const [role, account] of Object.entries(testAccounts)) {
    try {
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password
      });

      if (authError) {
        console.error(`Failed to create ${role} auth account:`, authError);
        continue;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${role}`);
        continue;
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
        console.error(`Failed to create ${role} profile:`, profileError);
        continue;
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
          console.error('Failed to create collector profile:', collectorError);
        }
      }

      console.log(`Successfully created ${role} account`);
    } catch (error) {
      console.error(`Error creating ${role} account:`, error);
    }
  }
}