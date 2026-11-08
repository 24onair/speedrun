"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { extractYouTubeId, youTubeEmbedUrl } from "../lib/youtube";

export type GallerySlide = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  thumb: string;
  caption: string;
};

export type GalleryGroup = {
  id: string;
  title: string;
  dateLabel: string;
  slides: GallerySlide[];
};

/* 갤러리 그리드 + 라이트박스 — 앨범 단위 카드, 클릭하면 앨범 안을 슬라이드 */
export default function GalleryGrid({ groups }: { groups: GalleryGroup[] }) {
  const t = useTranslations("gallery");
  const [open, setOpen] = useState<{ group: number; slide: number } | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  const currentGroup = open === null ? null : groups[open.group];
  const slideCount = currentGroup?.slides.length ?? 0;
  const current = open === null ? null : currentGroup?.slides[open.slide] ?? null;

  const next = useCallback(
    () => setOpen((o) => (o === null ? o : { ...o, slide: (o.slide + 1) % slideCount })),
    [slideCount],
  );
  const prev = useCallback(
    () => setOpen((o) => (o === null ? o : { ...o, slide: (o.slide - 1 + slideCount) % slideCount })),
    [slideCount],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  // 자동 슬라이드 — 영상이 열려 있는 동안은 멈춘다
  const currentVideoId = current?.videoUrl ? extractYouTubeId(current.videoUrl) : null;
  useEffect(() => {
    if (open === null || !autoplay || currentVideoId || slideCount < 2) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [open, autoplay, currentVideoId, slideCount, next]);

  return (
    <>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, gi) => {
          const cover = group.slides[0];
          return (
            <figure key={group.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen({ group: gi, slide: 0 })}
                className="group relative block w-full cursor-zoom-in"
                aria-label={group.title || t("open")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover?.thumb}
                  alt={group.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {cover?.videoUrl && (
                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-deep/70 pl-1 text-xl text-accent backdrop-blur">
                      ▶
                    </span>
                  </span>
                )}
                {group.slides.length > 1 && (
                  <span className="hud absolute bottom-2 right-2 rounded bg-bg-deep/80 px-2 py-0.5 text-xs text-fg" aria-hidden>
                    ⧉ {group.slides.length}
                  </span>
                )}
              </button>
              <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="truncate text-sm text-fg/90">{group.title}</span>
                <span className="hud shrink-0 text-xs text-muted">{group.dateLabel}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* 라이트박스 */}
      {current && currentGroup && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-bg-deep/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <div className="hud min-w-0 truncate text-xs text-muted">
              <span className="text-fg">{currentGroup.title}</span>
              {slideCount > 1 && <span> · {(open?.slide ?? 0) + 1} / {slideCount}</span>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {slideCount > 1 && (
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
              )}
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label={t("close")}
                className="hud flex h-10 w-10 items-center justify-center rounded border border-line text-muted transition-colors hover:border-accent hover:text-accent"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-4" onClick={(e) => e.stopPropagation()}>
            {slideCount > 1 && (
              <button
                type="button"
                onClick={prev}
                aria-label={t("prev")}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-deep/70 text-fg transition-colors hover:border-accent hover:text-accent"
              >
                ←
              </button>
            )}
            {currentVideoId ? (
              <iframe
                key={current.id}
                src={`${youTubeEmbedUrl(currentVideoId)}?autoplay=1`}
                title={current.caption || currentGroup.title || "YouTube video"}
                className="aspect-video max-h-full w-full max-w-5xl border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={current.id}
                src={current.imageUrl ?? current.thumb}
                alt={current.caption}
                className="max-h-full max-w-full rounded object-contain"
              />
            )}
            {slideCount > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label={t("next")}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-deep/70 text-fg transition-colors hover:border-accent hover:text-accent"
              >
                →
              </button>
            )}
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
