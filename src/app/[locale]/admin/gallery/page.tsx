import { getTranslations, setRequestLocale } from "next-intl/server";
import GalleryAdminCard from "../../../../components/admin/GalleryAdminCard";
import GalleryUploader from "../../../../components/admin/GalleryUploader";
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
    .select("id, image_url, video_url, caption, caption_en, taken_on")
    .order("created_at", { ascending: false })
    .limit(30);

  const items = (gallery ?? []).map((item) => {
    const ytId = item.video_url ? extractYouTubeId(item.video_url) : null;
    return {
      id: item.id,
      thumb: item.image_url ?? (ytId ? youTubeThumbnail(ytId) : ""),
      isVideo: Boolean(item.video_url),
      caption: item.caption ?? "",
      captionEn: item.caption_en ?? "",
      takenOn: item.taken_on ?? "",
      videoUrl: item.video_url ?? "",
    };
  });

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("galleryTitle")}</h2>
      <div className="card mt-4 p-6">
        <GalleryUploader />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("recentGallery")}</h2>
      {!items.length ? (
        <p className="card mt-4 p-6 text-sm text-muted">{t("noneGallery")}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <GalleryAdminCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
