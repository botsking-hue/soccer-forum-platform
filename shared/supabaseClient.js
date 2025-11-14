// shared/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export function handleSupabaseError(error) {
  console.error('Supabase Error:', error);
  
  if (error.code) {
    switch (error.code) {
      case '23505':
        return { error: 'Record already exists' };
      case '42501':
        return { error: 'Permission denied' };
      default:
        return { error: error.message || 'Database error occurred' };
    }
  }
  
  return { error: error.message || 'An unexpected error occurred' };
}