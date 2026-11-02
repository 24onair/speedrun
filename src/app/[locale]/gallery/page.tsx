import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

type GalleryRow = {
  id: string;
  image_url: string;
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
      .select("id, image_url, caption, caption_en, taken_on, created_at")
      .order("created_at", { ascending: false })
      .limit(60)
      .returns<GalleryRow[]>();
    items = data ?? [];
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t("lead")}</p>

      {!items.length ? (
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const caption =
              locale === "en" && item.caption_en ? item.caption_en : item.caption;
            return (
              <figure key={item.id} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element — Supabase Storage 외부 URL */}
                <img
                  src={item.image_url}
                  alt={caption ?? ""}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-sm text-fg/90">{caption ?? ""}</span>
                  <span className="hud shrink-0 text-xs text-muted">
                    {format.dateTime(new Date(item.taken_on ?? item.created_at), {
                      dateStyle: "medium",
                    })}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
