/* 유튜브 URL 판별·ID 추출 — watch/youtu.be/shorts/embed/live 형태 지원 */
const YT_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?[^ \n]*v=([\w-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/,
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(?:shorts|embed|live)\/([\w-]{11})/,
];

export function extractYouTubeId(text: string): string | null {
  for (const pattern of YT_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youTubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
