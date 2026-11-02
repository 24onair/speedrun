/** 기록(ms) → "HH:MM:SS" */
export function formatMs(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** "HH:MM:SS" 또는 "MM:SS" → ms (잘못된 입력은 null) */
export function parseTimeToMs(input: string): number | null {
  const parts = input.trim().split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts.some((p) => !/^\d{1,2}$/.test(p))) return null;
  const nums = parts.map(Number);
  const [h, m, s] = parts.length === 3 ? nums : [0, nums[0], nums[1]];
  if (m > 59 || s > 59) return null;
  const ms = ((h * 60 + m) * 60 + s) * 1000;
  return ms > 0 ? ms : null;
}
