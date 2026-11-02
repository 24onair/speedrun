"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { extractYouTubeId, youTubeEmbedUrl, youTubeThumbnail } from "../lib/youtube";

export type GalleryGridItem = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  caption: string;
  dateLabel: string;
};

/* 갤러리 그리드 + 라이트박스 — 클릭 팝업, 좌우 이동, 자동 슬라이드, 유튜브 재생 */
export default function GalleryGrid({ items }: { items: GalleryGridItem[] }) {
  const t = useTranslations("gallery");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  const count = items.length;
  const next = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );
  const prev = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );

  // 키보드: Esc 닫기, ←/→ 이동
  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, next, prev]);

  // 자동 슬라이드 — 영상이 열려 있는 동안은 멈춘다
  const current = openIdx === null ? null : items[openIdx];
  const currentVideoId = current?.videoUrl ? extractYouTubeId(current.videoUrl) : null;
  useEffect(() => {
    if (openIdx === null || !autoplay || currentVideoId) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [openIdx, autoplay, currentVideoId, next]);

  const thumbOf = (item: GalleryGridItem) => {
    if (item.imageUrl) return item.imageUrl;
    const id = item.videoUrl ? extractYouTubeId(item.videoUrl) : null;
    return id ? youTubeThumbnail(id) : "";
  };

  return (
    <>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <figure key={item.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIdx(i)}
              className="group relative block w-full cursor-zoom-in"
              aria-label={item.caption || t("open")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbOf(item)}
                alt={item.caption}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {item.videoUrl && (
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-deep/70 pl-1 text-xl text-accent backdrop-blur">
                    ▶
                  </span>
                </span>
              )}
            </button>
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="truncate text-sm text-fg/90">{item.caption}</span>
              <span className="hud shrink-0 text-xs text-muted">{item.dateLabel}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 라이트박스 */}
      {current && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-bg-deep/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIdx(null)}
        >
          <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <span className="hud text-xs text-muted">
              {(openIdx ?? 0) + 1} / {count}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoplay((v) => !v)}
                className={`hud rounded border px-3 py-2 text-xs transition-colors ${
                  autoplay
                    ? "border-accent text-accent"
                    : "border-line text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {autoplay ? "❚❚ " : "▶ "}
                {t("autoplay")}
              </button>
              <button
                type="button"
                onClick={() => setOpenIdx(null)}
                aria-label={t("close")}
                className="hud flex h-10 w-10 items-center justify-center rounded border border-line text-muted transition-colors hover:border-accent hover:text-accent"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={prev}
              aria-label={t("prev")}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-deep/70 text-fg transition-colors hover:border-accent hover:text-accent"
            >
              ←
            </button>
            {currentVideoId ? (
              <iframe
                src={`${youTubeEmbedUrl(currentVideoId)}?autoplay=1`}
                title={current.caption || "YouTube video"}
                className="aspect-video max-h-full w-full max-w-5xl border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbOf(current)}
                alt={current.caption}
                className="max-h-full max-w-full rounded object-contain"
              />
            )}
            <button
              type="button"
              onClick={next}
              aria-label={t("next")}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-deep/70 text-fg transition-colors hover:border-accent hover:text-accent"
            >
              →
            </button>
          </div>

          {current.caption && (
            <p className="px-4 pb-5 text-center text-sm text-fg/90" onClick={(e) => e.stopPropagation()}>
              {current.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
