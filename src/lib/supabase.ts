/**
 * Supabase Client Configuration
 * 
 * Creates and exports the Supabase client instance for database operations.
 * Uses environment variables for URL and API key (never hardcoded).
 */

import { createClient } from '@supabase/supabase-js';
import { getUserId } from '../utils/session';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Gets the current user ID from the session.
 * Auto-creates a session if one doesn't exist.
 * 
 * @returns The current user's ID
 */
export function getCurrentUserId(): string {
  return getUserId();
}
