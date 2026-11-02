/* 한국어 → 영어 자동 번역 (Claude Haiku).
   ANTHROPIC_API_KEY가 없거나 호출이 실패하면 null을 돌려주고,
   호출부는 영문 필드를 비워둔 채 저장한다 (수동 입력과 공존). */

const SYSTEM_PROMPT = `You translate Korean copy for "SPEED RUN", a paragliding
time-attack race site with an F1-inspired tone (confident, punchy, sporty).
Translate the given Korean fields to natural English. Keep proper nouns
(SPEED RUN, Hapcheon, EN-B/EN-C/EN-D/CCC, PARA), units and line breaks.
Respond with ONLY a JSON object with the same keys, values translated.`;

export async function translateFieldsToEn(
  fields: Record<string, string>,
): Promise<Record<string, string> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const entries = Object.entries(fields).filter(([, v]) => v?.trim());
  if (!apiKey || entries.length === 0) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: JSON.stringify(Object.fromEntries(entries)) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) return null;
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const out: Record<string, string> = {};
    for (const [key] of entries) {
      if (typeof parsed[key] === "string" && parsed[key].trim()) {
        out[key] = parsed[key].trim();
      }
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}
