"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "../../i18n/navigation";
import { createClient, isSupabaseConfigured } from "../supabase/server";

import { CHECKLIST_KEYS, CLASSES } from "../register-constants";

export type RegisterState = { error: string | null };

export async function submitRegistration(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  if (!isSupabaseConfigured()) return { error: "not_configured" };
  const supabase = await createClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_signed_in" };

  const eventId = String(formData.get("eventId") ?? "");
  const cls = String(formData.get("class") ?? "");
  const depositorName = String(formData.get("depositorName") ?? "").trim();
  if (!eventId || !CLASSES.includes(cls as (typeof CLASSES)[number]) || !depositorName) {
    return { error: "missing_fields" };
  }

  // 체크리스트 6문항 전부 필수
  const checklist: Record<string, boolean> = {};
  for (const key of CHECKLIST_KEYS) {
    const checked = formData.get(`check_${key}`) === "on";
    if (!checked) return { error: "checklist_incomplete" };
    checklist[key] = true;
  }

  // 동의 3종 전부 필수
  const agreeWaiver = formData.get("agree_waiver") === "on";
  const agreePrivacy = formData.get("agree_privacy") === "on";
  const agreeMedia = formData.get("agree_media") === "on";
  if (!agreeWaiver || !agreePrivacy || !agreeMedia) {
    return { error: "agreements_required" };
  }

  // 선수 정보는 프로필에 함께 저장
  const org = String(formData.get("org") ?? "").trim();
  const glider = String(formData.get("glider") ?? "").trim();
  const license = String(formData.get("license") ?? "").trim();
  await supabase
    .from("profiles")
    .update({ org, glider, license, class: cls, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  const { error } = await supabase.from("registrations").insert({
    user_id: user.id,
    event_id: eventId,
    class: cls,
    checklist,
    agree_waiver: agreeWaiver,
    agree_privacy: agreePrivacy,
    agree_media: agreeMedia,
    depositor_name: depositorName,
  });
  if (error) {
    if (error.code === "23505") return { error: "already_registered" };
    return { error: error.message };
  }

  redirect({ href: "/register/done", locale });
  return { error: null };
}
