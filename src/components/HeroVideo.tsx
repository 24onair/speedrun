"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/* 히어로 배경 영상 — prefers-reduced-motion이면 재생하지 않고 poster만 보여주고,
   자동재생 루프에는 일시정지 컨트롤을 제공한다 (WCAG 2.2.2) */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        ref.current?.pause();
        setPlaying(false);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const t = useTranslations("hero");

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src="/media/hero.mp4"
        poster="/media/hero-poster.jpg"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        aria-hidden
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t("videoPause") : t("videoPlay")}
        className="hud absolute bottom-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line/60 bg-bg-deep/60 text-xs text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        {playing ? "❚❚" : "▶"}
      </button>
    </>
  );
}
