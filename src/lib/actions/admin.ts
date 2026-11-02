"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { CLASSES } from "../register-constants";
import { parseTimeToMs } from "../time";

// RLS(is_admin 정책)가 최종 방어선이고, 여기서는 UX를 위해 선검사만 한다
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? supabase : null;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function setRegistrationStatus(
  id: string,
  status: "confirmed" | "cancelled" | "pending",
) {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from("registrations").update({ status }).eq("id", id);
  revalidateAll();
}

export type RecordState = { error: string | null; ok?: boolean };

export async function addRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const pilotId = String(formData.get("pilotId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const cls = String(formData.get("class") ?? "");
  const timeStr = String(formData.get("time") ?? "");
  const flownOn = String(formData.get("flownOn") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!pilotId || !eventId || !CLASSES.includes(cls as (typeof CLASSES)[number])) {
    return { error: "missing_fields" };
  }
  const timeMs = parseTimeToMs(timeStr);
  if (!timeMs) return { error: "invalid_time" };

  const { error } = await supabase.from("records").insert({
    pilot_id: pilotId,
    event_id: eventId,
    class: cls,
    time_ms: timeMs,
    flown_on: flownOn || undefined,
    note: note || null,
  });
  if (error) return { error: error.message };

  revalidateAll();
  return { error: null, ok: true };
}

export async function deleteRecord(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from("records").delete().eq("id", id);
  revalidateAll();
}
