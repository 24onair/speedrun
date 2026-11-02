"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "../../lib/supabase/client";

/* 관리자 갤러리 업로드 — gallery 버킷(관리자만 쓰기) */
export default function GalleryUploader() {
  const t = useTranslations("admin");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("gallery_items").insert({
        image_url: pub.publicUrl,
        caption: caption.trim() || null,
        caption_en: captionEn.trim() || null,
      });
      if (dbErr) throw dbErr;
      setMsg({ ok: true, text: t("uploaded") });
      setCaption("");
      setCaptionEn("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        className="text-sm text-muted file:mr-4 file:rounded file:border file:border-line file:bg-panel file:px-4 file:py-2 file:text-sm file:text-fg"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          {t("caption")}
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t("captionEn")}
          <input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} className={inputCls} />
        </label>
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`}>{msg.text}</p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary self-start text-sm disabled:opacity-60">
        {busy ? "…" : t("upload")}
      </button>
    </form>
  );
}
