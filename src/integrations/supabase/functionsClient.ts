/**
 * Dedicated Supabase client for Edge Functions.
 *
 * iMed Guatemala uses two Supabase projects:
 *   - aijuacqdvrbflzwqhmvn  →  Database, Auth, RLS (main app client)
 *   - usmjxdoboaxpbmuoproo  →  Edge Functions (analyze-medicine, analyze-document, etc.)
 *
 * Use `functionsClient.functions.invoke(...)` instead of `supabase.functions.invoke(...)`
 * whenever calling an Edge Function.
 */
import { createClient } from '@supabase/supabase-js';

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL as string;
const FUNCTIONS_KEY = import.meta.env.VITE_FUNCTIONS_KEY as string;

export const functionsClient = createClient(FUNCTIONS_URL, FUNCTIONS_KEY, {
  auth: { persistSession: false },
});
