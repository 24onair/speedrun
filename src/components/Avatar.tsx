/* 프로필 사진 또는 이니셜 원형 — 리더보드·프로필 공용 */
export default function Avatar({
  name,
  src,
  size = 64,
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const dim = { width: size, height: size };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element — Supabase Storage 외부 URL
      <img
        src={src}
        alt=""
        style={dim}
        className={`rounded-full border border-line object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={{ ...dim, fontSize: size * 0.33 }}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-sky font-black text-bg-deep ${className}`}
      aria-hidden
    >
      {name.charAt(0)}
    </div>
  );
}
