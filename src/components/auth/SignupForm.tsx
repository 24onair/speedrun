"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "../../i18n/navigation";
import Avatar from "../Avatar";
import { createClient } from "../../lib/supabase/client";

/* 가입 즉시 로그인되는 플로우 (이메일 확인 비활성) — 프로필 사진까지 한 번에 받는다 */
export default function SignupForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const phone = String(form.get("phone") ?? "").trim();

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), phone } },
      });
      if (err) {
        setError(
          err.code === "user_already_exists" ? "user_exists" : err.message,
        );
        return;
      }

      // 이메일 확인이 다시 켜지면 세션이 없다 — 그 경우 로그인 안내로 폴백
      if (!data.session || !data.user) {
        router.push("/login?signup=1");
        return;
      }

      if (photo) {
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${data.user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, photo, { upsert: true, cacheControl: "3600" });
        if (!upErr) {
          const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
          await supabase
            .from("profiles")
            .update({ avatar_url: `${pub.publicUrl}?v=${Date.now()}` })
            .eq("id", data.user.id);
        }
      }

      router.push("/register");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {/* 프로필 사진 (선택) */}
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-18 w-18 rounded-full border border-line object-cover" style={{ width: 72, height: 72 }} />
        ) : (
          <Avatar name={name || "?"} size={72} />
        )}
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-sm text-muted">{t("photoLabel")}</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn btn-ghost px-3 py-1.5 text-xs"
          >
            {t("choosePhoto")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setPhoto(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        {t("name")}
        <input name="name" required autoComplete="name" value={name}
          onChange={(e) => setName(e.target.value)} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("phone")}
        <input name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("email")}
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("password")}
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className={inputCls} />
      </label>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {t.has(`errors.${error}`) ? t(`errors.${error}` as never) : error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary mt-2 justify-center disabled:opacity-60">
        {busy ? "…" : t("signupBtn")}
      </button>
    </form>
  );
}
