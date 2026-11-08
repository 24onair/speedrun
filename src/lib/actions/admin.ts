"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { CLASSES } from "../register-constants";
import { parseTimeToMs } from "../time";
import { translateFieldsToEn } from "../translate";
import { extractYouTubeId, youTubeThumbnail } from "../youtube";

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

export type PostState = { error: string | null; ok?: boolean };

export async function addPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  let titleEn = String(formData.get("titleEn") ?? "").trim();
  let bodyEn = String(formData.get("bodyEn") ?? "").trim();
  if (!["notice", "news", "event"].includes(category) || !title || !body) {
    return { error: "missing_fields" };
  }

  // 영문을 비워두면 자동 번역 (실패 시 비워둔 채 저장)
  if (!titleEn && !bodyEn) {
    const translated = await translateFieldsToEn({ title, body });
    if (translated) {
      titleEn = translated.title ?? "";
      bodyEn = translated.body ?? "";
    }
  }

  const { error } = await supabase.from("posts").insert({
    category,
    title,
    body,
    title_en: titleEn || null,
    body_en: bodyEn || null,
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null, ok: true };
}

export async function updatePost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const id = String(formData.get("id") ?? "");
  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  let titleEn = String(formData.get("titleEn") ?? "").trim();
  let bodyEn = String(formData.get("bodyEn") ?? "").trim();
  if (!id || !["notice", "news", "event"].includes(category) || !title || !body) {
    return { error: "missing_fields" };
  }

  if (!titleEn && !bodyEn) {
    const translated = await translateFieldsToEn({ title, body });
    if (translated) {
      titleEn = translated.title ?? "";
      bodyEn = translated.body ?? "";
    }
  }

  const { error } = await supabase
    .from("posts")
    .update({
      category,
      title,
      body,
      title_en: titleEn || null,
      body_en: bodyEn || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null, ok: true };
}

export async function deletePost(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from("posts").delete().eq("id", id);
  revalidateAll();
}

// ── 갤러리 앨범 ────────────────────────────────────────────────

export type AlbumItemInput = {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
};

export async function createGalleryAlbum(input: {
  title: string;
  items: AlbumItemInput[];
}): Promise<{ error: string | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const title = input.title.trim();
  if (!title || !input.items.length || input.items.length > 60) {
    return { error: "missing_fields" };
  }

  // 항목 정리 (유튜브 정규화 + 썸네일)
  const items: { image_url: string | null; video_url: string | null; caption: string }[] = [];
  for (const item of input.items) {
    if (item.videoUrl?.trim()) {
      const ytId = extractYouTubeId(item.videoUrl);
      if (!ytId) return { error: "invalid_youtube" };
      items.push({
        image_url: youTubeThumbnail(ytId),
        video_url: `https://www.youtube.com/watch?v=${ytId}`,
        caption: item.caption.trim(),
      });
    } else if (item.imageUrl) {
      items.push({ image_url: item.imageUrl, video_url: null, caption: item.caption.trim() });
    }
  }
  if (!items.length) return { error: "missing_fields" };

  // 제목 + 설명 전부 한 번의 호출로 번역
  const fields: Record<string, string> = { title };
  items.forEach((item, i) => {
    if (item.caption) fields[`c${i}`] = item.caption;
  });
  const translated = await translateFieldsToEn(fields);

  const { data: album, error: albumErr } = await supabase
    .from("gallery_albums")
    .insert({ title, title_en: translated?.title ?? null })
    .select("id")
    .single();
  if (albumErr || !album) return { error: albumErr?.message ?? "album_failed" };

  const { error: itemsErr } = await supabase.from("gallery_items").insert(
    items.map((item, i) => ({
      album_id: album.id,
      sort: i,
      image_url: item.image_url,
      video_url: item.video_url,
      caption: item.caption || null,
      caption_en: translated?.[`c${i}`] ?? null,
    })),
  );
  if (itemsErr) return { error: itemsErr.message };

  revalidateAll();
  return { error: null };
}

export async function updateGalleryAlbum(input: {
  id: string;
  title: string;
  titleEn: string;
  items: { id: string; caption: string; captionEn: string }[];
  removeIds: string[];
}): Promise<{ error: string | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const title = input.title.trim();
  if (!input.id || !title) return { error: "missing_fields" };

  // 비어 있는 영문만 자동 번역 (직접 쓴 번역은 보존)
  const fields: Record<string, string> = {};
  if (!input.titleEn.trim()) fields.title = title;
  input.items.forEach((item) => {
    if (item.caption.trim() && !item.captionEn.trim()) fields[`c_${item.id}`] = item.caption.trim();
  });
  const translated =
    Object.keys(fields).length > 0 ? await translateFieldsToEn(fields) : null;

  const { error: albumErr } = await supabase
    .from("gallery_albums")
    .update({
      title,
      title_en: input.titleEn.trim() || translated?.title || null,
    })
    .eq("id", input.id);
  if (albumErr) return { error: albumErr.message };

  for (const item of input.items) {
    const { error } = await supabase
      .from("gallery_items")
      .update({
        caption: item.caption.trim() || null,
        caption_en: item.captionEn.trim() || translated?.[`c_${item.id}`] || null,
      })
      .eq("id", item.id);
    if (error) return { error: error.message };
  }

  for (const id of input.removeIds) {
    await deleteGalleryItem(id);
  }

  revalidateAll();
  return { error: null };
}

export async function deleteGalleryAlbum(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return;
  // 스토리지 파일 정리 후 앨범 삭제 (items는 cascade)
  const { data: items } = await supabase
    .from("gallery_items")
    .select("image_url")
    .eq("album_id", id);
  const marker = "/object/public/gallery/";
  const paths = (items ?? [])
    .map((item) => {
      const idx = item.image_url?.indexOf(marker) ?? -1;
      return idx >= 0 ? item.image_url!.slice(idx + marker.length).split("?")[0] : null;
    })
    .filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from("gallery").remove(paths);
  await supabase.from("gallery_albums").delete().eq("id", id);
  revalidateAll();
}

export async function addGalleryItem(input: {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  captionEn: string;
}): Promise<{ error: string | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  let imageUrl = input.imageUrl ?? null;
  let videoUrl: string | null = null;
  if (input.videoUrl?.trim()) {
    const id = extractYouTubeId(input.videoUrl);
    if (!id) return { error: "invalid_youtube" };
    videoUrl = `https://www.youtube.com/watch?v=${id}`;
    imageUrl = imageUrl ?? youTubeThumbnail(id);
  }
  if (!imageUrl && !videoUrl) return { error: "missing_fields" };

  let en = input.captionEn.trim();
  const ko = input.caption.trim();
  if (ko && !en) {
    const translated = await translateFieldsToEn({ caption: ko });
    en = translated?.caption ?? "";
  }

  const { error } = await supabase.from("gallery_items").insert({
    image_url: imageUrl,
    video_url: videoUrl,
    caption: ko || null,
    caption_en: en || null,
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function updateGalleryItem(input: {
  id: string;
  caption: string;
  captionEn: string;
  takenOn: string;
  videoUrl: string;
}): Promise<{ error: string | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "forbidden" };

  const patch: Record<string, unknown> = {};

  const ko = input.caption.trim();
  let en = input.captionEn.trim();
  if (ko && !en) {
    const translated = await translateFieldsToEn({ caption: ko });
    en = translated?.caption ?? "";
  }
  patch.caption = ko || null;
  patch.caption_en = en || null;
  patch.taken_on = input.takenOn || null;

  if (input.videoUrl.trim()) {
    const ytId = extractYouTubeId(input.videoUrl);
    if (!ytId) return { error: "invalid_youtube" };
    patch.video_url = `https://www.youtube.com/watch?v=${ytId}`;
    // 썸네일이 유튜브 자동 썸네일이었다면 새 영상 것으로 교체
    const { data: item } = await supabase
      .from("gallery_items")
      .select("image_url")
      .eq("id", input.id)
      .single();
    if (!item?.image_url || item.image_url.includes("i.ytimg.com")) {
      patch.image_url = youTubeThumbnail(ytId);
    }
  }

  const { error } = await supabase
    .from("gallery_items")
    .update(patch)
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function deleteGalleryItem(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return;
  // 스토리지 파일도 함께 정리
  const { data: item } = await supabase
    .from("gallery_items")
    .select("image_url")
    .eq("id", id)
    .single();
  await supabase.from("gallery_items").delete().eq("id", id);
  const marker = "/object/public/gallery/";
  const idx = item?.image_url?.indexOf(marker) ?? -1;
  if (item && idx >= 0) {
    const path = item.image_url.slice(idx + marker.length).split("?")[0];
    await supabase.storage.from("gallery").remove([path]);
  }
  revalidateAll();
}
