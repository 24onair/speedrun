"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "../../i18n/navigation";
import { createClient, isSupabaseConfigured } from "../supabase/server";

export type AuthState = { error: string | null };

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "not_configured" };
  const supabase = await createClient();
  const locale = await getLocale();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!email || !password || !name) return { error: "missing_fields" };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });
  if (error) return { error: error.message };

  redirect({ href: "/login?signup=1", locale });
  return { error: null };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "not_configured" };
  const supabase = await createClient();
  const locale = await getLocale();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "invalid_credentials" };

  redirect({ href: "/register", locale });
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: "/", locale });
}
