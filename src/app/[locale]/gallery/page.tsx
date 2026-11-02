import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import GalleryGrid from "../../../components/GalleryGrid";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

type GalleryRow = {
  id: string;
  image_url: string | null;
  video_url: string | null;
  caption: string | null;
  caption_en: string | null;
  taken_on: string | null;
  created_at: string;
};

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const format = await getFormatter();

  let items: GalleryRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_items")
      .select("id, image_url, video_url, caption, caption_en, taken_on, created_at")
      .order("created_at", { ascending: false })
      .limit(60)
      .returns<GalleryRow[]>();
    items = data ?? [];
  }

  const gridItems = items.map((item) => ({
    id: item.id,
    imageUrl: item.image_url,
    videoUrl: item.video_url,
    caption: (locale === "en" && item.caption_en ? item.caption_en : item.caption) ?? "",
    dateLabel: format.dateTime(new Date(item.taken_on ?? item.created_at), {
      dateStyle: "medium",
    }),
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>

      {!gridItems.length ? (
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
      ) : (
        <GalleryGrid items={gridItems} />
      )}
    </section>
  );
}
