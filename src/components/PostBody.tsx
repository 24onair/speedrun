import { extractYouTubeId, youTubeEmbedUrl } from "../lib/youtube";

/* 소식 본문 렌더러 — 유튜브 링크가 있는 줄은 임베드 플레이어로 바꾼다 */
export default function PostBody({ body }: { body: string }) {
  const blocks = body.split(/\n/);

  return (
    <div className="max-w-2xl leading-relaxed text-fg/90">
      {blocks.map((line, i) => {
        const videoId = extractYouTubeId(line);
        if (videoId) {
          return (
            <div key={i} className="card my-5 overflow-hidden">
              <iframe
                src={youTubeEmbedUrl(videoId)}
                title="YouTube video"
                className="aspect-video w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          );
        }
        return line.trim() ? (
          <p key={i} className="min-h-[1em] whitespace-pre-wrap">{line}</p>
        ) : (
          <br key={i} />
        );
      })}
    </div>
  );
}
