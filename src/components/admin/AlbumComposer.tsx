"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createGalleryAlbum } from "../../lib/actions/admin";
import { createClient } from "../../lib/supabase/client";
import { extractYouTubeId, youTubeThumbnail } from "../../lib/youtube";

type DraftItem = {
  key: string;
  kind: "image" | "video";
  file?: File;
  preview: string;
  videoUrl?: string;
  caption: string;
};

/* 앨범 작성 — 사진 여러 장 + 유튜브 여러 개를 한 포스트로, 항목별 설명 입력 */
export default function AlbumComposer() {
  const t = useTranslations("admin");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files].map((file) => ({
      key: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: "image" as const,
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));
    setItems((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addYoutube = () => {
    const ytId = extractYouTubeId(ytUrl);
    if (!ytId) {
      setMsg({ ok: false, text: t("errors.invalid_youtube") });
      return;
    }
    setMsg(null);
    setItems((prev) => [
      ...prev,
      {
        key: `v-${Date.now()}`,
        kind: "video",
        preview: youTubeThumbnail(ytId),
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        caption: "",
      },
    ]);
    setYtUrl("");
  };

  const setCaption = (key: string, caption: string) =>
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, caption } : item)));
  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((item) => item.key !== key));

  const publish = async () => {
    if (!title.trim() || !items.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const payload = [];
      let done = 0;
      for (const item of items) {
        if (item.kind === "image" && item.file) {
          done += 1;
          setProgress(`${done}/${items.filter((i) => i.kind === "image").length}`);
          const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("gallery")
            .upload(path, item.file, { cacheControl: "3600" });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
          payload.push({ imageUrl: pub.publicUrl, caption: item.caption });
        } else if (item.kind === "video" && item.videoUrl) {
          payload.push({ videoUrl: item.videoUrl, caption: item.caption });
        }
      }
      setProgress("…");
      const { error } = await createGalleryAlbum({ title, items: payload });
      if (error) throw new Error(error);
      setMsg({ ok: true, text: t("albumPublished") });
      setTitle("");
      setItems([]);
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
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        {t("albumTitle")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </label>

      <div className="flex flex-wrap items-end gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost text-sm">
          + {t("addPhotos")}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex min-w-60 flex-1 gap-2">
          <input
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            placeholder="https://youtu.be/…"
            className={`${inputCls} hud flex-1 py-2 text-sm`}
          />
          <button type="button" onClick={addYoutube} className="btn btn-ghost text-sm">
            + {t("addYoutube")}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={item.key} className="card flex items-center gap-3 p-3">
              <span className="hud w-6 shrink-0 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-14 w-20 rounded object-cover" />
                {item.kind === "video" && (
                  <span className="hud absolute left-1 top-1 rounded bg-bg-deep/80 px-1 text-[10px] text-accent" aria-hidden>
                    ▶
                  </span>
                )}
              </div>
              <input
                value={item.caption}
                onChange={(e) => setCaption(item.key, e.target.value)}
                placeholder={t("itemCaption")}
                className="card min-w-0 flex-1 px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                aria-label={t("delete")}
                className="btn btn-ghost shrink-0 px-2.5 py-1.5 text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {msg && <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`}>{msg.text}</p>}

      <button
        type="button"
        onClick={publish}
        disabled={busy || !title.trim() || !items.length}
        className="btn btn-primary self-start text-sm disabled:opacity-50"
      >
        {busy ? progress || "…" : t("publishAlbum")}
      </button>
    </div>
  );
}
