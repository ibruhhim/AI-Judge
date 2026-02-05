/**
 * Deno Type Declarations for Supabase Edge Functions
 * 
 * This file provides type definitions for Deno runtime APIs
 * used in Supabase Edge Functions. These types are available
 * at runtime in Supabase, but need to be declared for TypeScript.
 */

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(url: string, key: string): any;
  export type SupabaseClient = any;
}
