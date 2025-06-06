import { SupabaseReminderRepository } from './SupabaseReminderRepository'
import { SupabaseManager } from '../config/supabase'

// Create singleton Supabase instance for repositories
const supabaseManager = new SupabaseManager({
  url: process.env.SUPABASE_URL || 'http://localhost:54321',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key',
  options: {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
});

supabaseManager.connect();

// Export the Supabase implementation as the default repository
export class ReminderRepository extends SupabaseReminderRepository {
  constructor() {
    super(supabaseManager.getClient());
  }
}

export default ReminderRepository;

// Re-export the interface for type checking
export type { ReminderRepository as IReminderRepository } from './interfaces/reminder'