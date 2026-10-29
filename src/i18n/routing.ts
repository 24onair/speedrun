import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "ko",
  localePrefix: "as-needed",
  // URL이 언어를 결정하도록 쿠키/Accept-Language 기반 리다이렉트를 끈다.
  // (안 끄면 /en 방문 후 루트(/)가 영문으로 리다이렉트됨)
  localeDetection: false,
});
