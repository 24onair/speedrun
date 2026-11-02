"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "../../i18n/navigation";
import { createClient, isSupabaseConfigured } from "../supabase/server";

export type AuthState = { error: string | null };

// 가입은 클라이언트(SignupForm)에서 처리 — 즉시 세션 + 프로필 사진 업로드

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
