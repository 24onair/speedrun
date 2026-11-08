import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import AlbumAdminCard from "../../../../components/admin/AlbumAdminCard";
import AlbumComposer from "../../../../components/admin/AlbumComposer";
import GalleryAdminCard from "../../../../components/admin/GalleryAdminCard";
import { createClient } from "../../../../lib/supabase/server";
import { extractYouTubeId, youTubeThumbnail } from "../../../../lib/youtube";

type ItemRow = {
  id: string;
  image_url: string | null;
  video_url: string | null;
  caption: string | null;
  caption_en: string | null;
  taken_on: string | null;
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

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const supabase = await createClient();

  const [{ data: albums }, { data: singles }] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select("id, title, title_en, created_at, items:gallery_items(id, image_url, video_url, caption, caption_en, taken_on, sort)")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<AlbumRow[]>(),
    supabase
      .from("gallery_items")
      .select("id, image_url, video_url, caption, caption_en, taken_on, sort")
      .is("album_id", null)
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<ItemRow[]>(),
  ]);

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("albumCompose")}</h2>
      <div className="card mt-4 p-6">
        <AlbumComposer />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("albums")}</h2>
      {!albums?.length ? (
        <p className="card mt-4 p-6 text-sm text-muted">{t("noneGallery")}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {albums.map((album) => (
            <AlbumAdminCard
              key={album.id}
              album={{
                id: album.id,
                title: album.title,
                titleEn: album.title_en ?? "",
                dateLabel: format.dateTime(new Date(album.created_at), { dateStyle: "medium" }),
                items: [...album.items]
                  .sort((a, b) => a.sort - b.sort)
                  .map((item) => ({
                    id: item.id,
                    thumb: thumbOf(item),
                    isVideo: Boolean(item.video_url),
                    caption: item.caption ?? "",
                    captionEn: item.caption_en ?? "",
                  })),
              }}
            />
          ))}
        </div>
      )}

      {/* 앨범 이전에 올린 낱장 항목 */}
      {Boolean(singles?.length) && (
        <>
          <h2 className="display mt-12 text-2xl font-bold">{t("recentGallery")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {singles!.map((item) => (
              <GalleryAdminCard
                key={item.id}
                item={{
                  id: item.id,
                  thumb: thumbOf(item),
                  isVideo: Boolean(item.video_url),
                  caption: item.caption ?? "",
                  captionEn: item.caption_en ?? "",
                  takenOn: item.taken_on ?? "",
                  videoUrl: item.video_url ?? "",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
