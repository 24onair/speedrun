"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteGalleryItem, updateGalleryItem } from "../../lib/actions/admin";

export type GalleryAdminItem = {
  id: string;
  thumb: string;
  isVideo: boolean;
  caption: string;
  captionEn: string;
  takenOn: string;
  videoUrl: string;
};

/* 관리자 갤러리 카드 — 수정(캡션 한/영·촬영일·유튜브 링크)과 삭제 */
export default function GalleryAdminCard({ item }: { item: GalleryAdminItem }) {
  const t = useTranslations("admin");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState(item.caption);
  const [captionEn, setCaptionEn] = useState(item.captionEn);
  const [takenOn, setTakenOn] = useState(item.takenOn);
  const [videoUrl, setVideoUrl] = useState(item.videoUrl);

  const save = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await updateGalleryItem({
      id: item.id,
      caption,
      captionEn,
      takenOn,
      videoUrl,
    });
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      setEditing(false);
    }
  };

  const inputCls = "card w-full px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="card relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.thumb} alt={item.caption} className="aspect-square w-full object-cover" />
      {item.isVideo && (
        <span className="hud absolute left-2 top-2 rounded bg-bg-deep/80 px-2 py-0.5 text-xs text-accent" aria-hidden>
          ▶
        </span>
      )}

      {editing ? (
        <div className="flex flex-col gap-2 p-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("caption")}
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("captionEn")}
            <input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("takenOn")}
            <input type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} className={inputCls} />
          </label>
          {item.isVideo && (
            <label className="flex flex-col gap-1 text-xs text-muted">
              {t("youtubeUrl")}
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`${inputCls} hud`} />
            </label>
          )}
          {error && <p className="text-xs text-accent">{t.has(`errors.${error}`) ? t(`errors.${error}` as never) : error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost px-3 py-1.5 text-xs">
              {t("editCancel")}
            </button>
            <button type="button" onClick={save} disabled={busy} className="btn btn-primary !px-3 py-1.5 text-xs disabled:opacity-60">
              {busy ? "…" : t("save")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 p-2">
          <span className="truncate pl-1 text-xs text-muted">{item.caption}</span>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost px-2 py-1 text-xs">
              {t("edit")}
            </button>
            <form action={deleteGalleryItem.bind(null, item.id)}>
              <button className="btn btn-ghost px-2 py-1 text-xs">{t("delete")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
