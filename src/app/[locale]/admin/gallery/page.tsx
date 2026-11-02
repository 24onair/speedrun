import { getTranslations, setRequestLocale } from "next-intl/server";
import GalleryUploader from "../../../../components/admin/GalleryUploader";
import { deleteGalleryItem } from "../../../../lib/actions/admin";
import { createClient } from "../../../../lib/supabase/server";
import { extractYouTubeId, youTubeThumbnail } from "../../../../lib/youtube";

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("gallery_items")
    .select("id, image_url, video_url, caption")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("galleryTitle")}</h2>
      <div className="card mt-4 p-6">
        <GalleryUploader />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("recentGallery")}</h2>
      {!gallery?.length ? (
        <p className="card mt-4 p-6 text-sm text-muted">{t("noneGallery")}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item) => {
            const ytId = item.video_url ? extractYouTubeId(item.video_url) : null;
            const thumb = item.image_url ?? (ytId ? youTubeThumbnail(ytId) : "");
            return (
              <div key={item.id} className="card relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt={item.caption ?? ""} className="aspect-square w-full object-cover" />
                {item.video_url && (
                  <span className="hud absolute left-2 top-2 rounded bg-bg-deep/80 px-2 py-0.5 text-xs text-accent" aria-hidden>
                    ▶
                  </span>
                )}
                <form action={deleteGalleryItem.bind(null, item.id)} className="p-2 text-right">
                  <button className="btn btn-ghost px-2 py-1 text-xs">{t("delete")}</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
