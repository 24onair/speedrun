"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { addGalleryItem } from "../../lib/actions/admin";
import { createClient } from "../../lib/supabase/client";

/* 관리자 갤러리 업로드 — 이미지 다중 선택 또는 유튜브 링크, 영문 캡션 자동 번역 */
export default function GalleryUploader() {
  const t = useTranslations("admin");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = [...(fileRef.current?.files ?? [])];
    const yt = ytUrl.trim();
    if (!files.length && !yt) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      let done = 0;
      for (const file of files) {
        done += 1;
        setProgress(`${done}/${files.length}`);
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gallery")
          .upload(path, file, { cacheControl: "3600" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
        const { error: dbErr } = await addGalleryItem({
          imageUrl: pub.publicUrl,
          caption,
          captionEn,
        });
        if (dbErr) throw new Error(dbErr);
      }
      if (yt) {
        const { error: ytErr } = await addGalleryItem({
          videoUrl: yt,
          caption,
          captionEn,
        });
        if (ytErr) throw new Error(ytErr);
      }
      setMsg({ ok: true, text: t("uploaded") });
      setCaption("");
      setCaptionEn("");
      setYtUrl("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="text-sm text-muted file:mr-4 file:rounded file:border file:border-line file:bg-panel file:px-4 file:py-2 file:text-sm file:text-fg"
      />
      <label className="flex flex-col gap-1.5 text-sm">
        {t("youtubeUrl")}
        <input
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          placeholder="https://youtu.be/…"
          className={`${inputCls} hud`}
        />
      </label>
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
        {busy ? progress || "…" : t("upload")}
      </button>
    </form>
  );
}
