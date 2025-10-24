"use client";

import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log(" Supabase not configured - running in UI preview mode");
    // Return a mock client for UI preview
    return null;
  }

  if (client) return client;

  client = createBrowserClient(supabaseUrl, supabaseKey);

  return client;
}
