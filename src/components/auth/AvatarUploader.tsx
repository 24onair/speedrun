"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Avatar from "../Avatar";
import { createClient } from "../../lib/supabase/client";

/* 마이페이지 프로필 사진 업로드 — avatars 버킷의 본인 폴더에 저장 */
export default function AvatarUploader({
  userId,
  name,
  avatarUrl,
}: {
  userId: string;
  name: string;
  avatarUrl: string | null;
}) {
  const t = useTranslations("mypage");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);
      if (dbErr) throw dbErr;
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={avatarUrl} size={72} />
      <div className="flex flex-col items-start gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="btn btn-ghost px-3 py-1.5 text-xs disabled:opacity-60"
        >
          {busy ? "…" : t("changePhoto")}
        </button>
        {error && <p className="text-xs text-accent">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </div>
  );
}
