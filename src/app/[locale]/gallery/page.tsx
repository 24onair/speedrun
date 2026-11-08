import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import GalleryGrid, { type GalleryGroup } from "../../../components/GalleryGrid";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
import { extractYouTubeId, youTubeThumbnail } from "../../../lib/youtube";

type ItemRow = {
  id: string;
  image_url: string | null;
  video_url: string | null;
  caption: string | null;
  caption_en: string | null;
  taken_on: string | null;
  created_at: string;
  sort: number;
};

type AlbumRow = {
  id: string;
  title: string;
  title_en: string | null;
  created_at: string;
  items: ItemRow[];
};

function thumbOf(item: ItemRow) {
  if (item.image_url) return item.image_url;
  const ytId = item.video_url ? extractYouTubeId(item.video_url) : null;
  return ytId ? youTubeThumbnail(ytId) : "";
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const format = await getFormatter();

  const groups: GalleryGroup[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: albums }, { data: singles }] = await Promise.all([
      supabase
        .from("gallery_albums")
        .select("id, title, title_en, created_at, items:gallery_items(id, image_url, video_url, caption, caption_en, taken_on, created_at, sort)")
        .order("created_at", { ascending: false })
        .limit(40)
        .returns<AlbumRow[]>(),
      supabase
        .from("gallery_items")
        .select("id, image_url, video_url, caption, caption_en, taken_on, created_at, sort")
        .is("album_id", null)
        .order("created_at", { ascending: false })
        .limit(40)
        .returns<ItemRow[]>(),
    ]);

    const slideOf = (item: ItemRow) => ({
      id: item.id,
      imageUrl: item.image_url,
      videoUrl: item.video_url,
      thumb: thumbOf(item),
      caption: (locale === "en" && item.caption_en ? item.caption_en : item.caption) ?? "",
    });
    const dateLabel = (iso: string) =>
      format.dateTime(new Date(iso), { dateStyle: "medium" });

    // 앨범 + (앨범 도입 전) 낱장을 날짜순으로 섞어 보여준다
    const merged: { createdAt: string; group: GalleryGroup }[] = [
      ...(albums ?? [])
        .filter((album) => album.items.length > 0)
        .map((album) => ({
          createdAt: album.created_at,
          group: {
            id: `album-${album.id}`,
            title: locale === "en" && album.title_en ? album.title_en : album.title,
            dateLabel: dateLabel(album.created_at),
            slides: [...album.items].sort((a, b) => a.sort - b.sort).map(slideOf),
          },
        })),
      ...(singles ?? []).map((item) => ({
        createdAt: item.created_at,
        group: {
          id: `item-${item.id}`,
          title: (locale === "en" && item.caption_en ? item.caption_en : item.caption) ?? "",
          dateLabel: dateLabel(item.taken_on ?? item.created_at),
          slides: [slideOf(item)],
        },
      })),
    ];
    merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    groups.push(...merged.map((m) => m.group));
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>

      {!groups.length ? (
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
      ) : (
        <GalleryGrid groups={groups} />
      )}
    </section>
  );
}
