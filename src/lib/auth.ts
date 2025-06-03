// lib/auth.ts
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const handleSignIn = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) console.error("Error:", error);
};

export const handleSignOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error:", error);
};
