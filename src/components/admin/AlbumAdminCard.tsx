"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteGalleryAlbum, updateGalleryAlbum } from "../../lib/actions/admin";

export type AlbumAdminData = {
  id: string;
  title: string;
  titleEn: string;
  dateLabel: string;
  items: { id: string; thumb: string; isVideo: boolean; caption: string; captionEn: string }[];
};

/* 관리자 앨범 카드 — 펼쳐서 제목·항목 설명 수정, 항목/앨범 삭제 */
export default function AlbumAdminCard({ album }: { album: AlbumAdminData }) {
  const t = useTranslations("admin");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(album.title);
  const [titleEn, setTitleEn] = useState(album.titleEn);
  const [items, setItems] = useState(album.items.map((item) => ({ ...item, remove: false })));

  const save = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await updateGalleryAlbum({
      id: album.id,
      title,
      titleEn,
      items: items
        .filter((item) => !item.remove)
        .map((item) => ({ id: item.id, caption: item.caption, captionEn: item.captionEn })),
      removeIds: items.filter((item) => item.remove).map((item) => item.id),
    });
    setBusy(false);
    if (err) setError(err);
    else setEditing(false);
  };

  const inputCls = "card w-full px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={album.items[0]?.thumb} alt="" className="h-14 w-20 rounded object-cover" />
          <span className="hud absolute bottom-1 right-1 rounded bg-bg-deep/80 px-1.5 text-[10px] text-fg">
            {album.items.length}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{album.title}</p>
          <p className="hud mt-0.5 text-xs text-muted">{album.dateLabel}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => setEditing((v) => !v)} className="btn btn-ghost px-3 py-1.5 text-xs">
            {editing ? t("editCancel") : t("edit")}
          </button>
          <form action={deleteGalleryAlbum.bind(null, album.id)}>
            <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("delete")}</button>
          </form>
        </div>
      </div>

      {/* 편집 영역 */}
      {editing && (
        <div className="flex flex-col gap-3 border-t border-line/50 bg-bg-deep/40 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-muted">
              {t("albumTitle")}
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              {t("titleEn")}
              <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputCls} />
            </label>
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className={`flex items-center gap-3 ${item.remove ? "opacity-40" : ""}`}>
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumb} alt="" className="h-12 w-16 rounded object-cover" />
                  {item.isVideo && (
                    <span className="hud absolute left-1 top-1 rounded bg-bg-deep/80 px-1 text-[10px] text-accent" aria-hidden>▶</span>
                  )}
                </div>
                <input
                  value={item.caption}
                  onChange={(e) =>
                    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, caption: e.target.value } : p)))
                  }
                  placeholder={t("itemCaption")}
                  className={`${inputCls} min-w-0 flex-1`}
                />
                <input
                  value={item.captionEn}
                  onChange={(e) =>
                    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, captionEn: e.target.value } : p)))
                  }
                  placeholder="EN"
                  className={`${inputCls} hidden min-w-0 flex-1 sm:block`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, remove: !p.remove } : p)))
                  }
                  aria-pressed={item.remove}
                  className={`btn btn-ghost shrink-0 px-2.5 py-1.5 text-xs ${item.remove ? "border-accent text-accent" : ""}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {error && <p className="text-xs text-accent">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost px-3 py-1.5 text-xs">
              {t("editCancel")}
            </button>
            <button type="button" onClick={save} disabled={busy} className="btn btn-primary !px-3 py-1.5 text-xs disabled:opacity-60">
              {busy ? "…" : t("save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
