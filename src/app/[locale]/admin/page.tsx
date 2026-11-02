import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "../../../i18n/navigation";
import GalleryUploader from "../../../components/admin/GalleryUploader";
import PostForm from "../../../components/admin/PostForm";
import RecordForm from "../../../components/admin/RecordForm";
import {
  deleteGalleryItem,
  deletePost,
  deleteRecord,
  setRegistrationStatus,
} from "../../../lib/actions/admin";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
import { formatMs } from "../../../lib/time";

type Reg = {
  id: string;
  class: string;
  status: "pending" | "confirmed" | "cancelled";
  depositor_name: string;
  created_at: string;
  profile: { name: string } | null;
  event: { title: string } | null;
};

type Rec = {
  id: string;
  class: string;
  time_ms: number;
  flown_on: string;
  profile: { name: string } | null;
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const tMy = await getTranslations("mypage");
  const format = await getFormatter();

  if (!isSupabaseConfigured()) redirect({ href: "/", locale });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h1 className="display text-4xl font-bold">{t("title")}</h1>
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("forbidden")}</p>
      </section>
    );
  }

  const [
    { data: regs },
    { data: pilots },
    { data: events },
    { data: records },
    { data: posts },
    { data: gallery },
  ] = await Promise.all([
      supabase
        .from("registrations")
        .select("id, class, status, depositor_name, created_at, profile:profiles(name), event:events(title)")
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<Reg[]>(),
      supabase.from("profiles").select("id, name").order("name"),
      supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }),
      supabase
        .from("records")
        .select("id, class, time_ms, flown_on, profile:profiles(name)")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<Rec[]>(),
      supabase
        .from("posts")
        .select("id, category, title, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("gallery_items")
        .select("id, image_url, caption")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  const statusCls = {
    pending: "text-accent-hi",
    confirmed: "text-good",
    cancelled: "text-muted",
  } as const;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">RACE CONTROL</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>

      {/* 참가신청 관리 */}
      <h2 className="display mt-12 text-2xl font-bold">{t("regsTitle")}</h2>
      <div className="card mt-4 overflow-x-auto">
        {!regs?.length ? (
          <p className="p-6 text-sm text-muted">{t("noRegs")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="hud border-b border-line bg-panel-2/60 text-left text-xs text-muted">
                <th scope="col" className="px-4 py-3 font-medium">{t("pilot")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("event")}</th>
                <th scope="col" className="px-4 py-3 font-medium">CLASS</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("depositor")}</th>
                <th scope="col" className="px-4 py-3 font-medium">STATUS</th>
                <th scope="col" className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {regs.map((reg) => (
                <tr key={reg.id} className="border-b border-line/50 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{reg.profile?.name}</td>
                  <td className="px-4 py-3 text-muted">{reg.event?.title}</td>
                  <td className="hud px-4 py-3 text-muted">{reg.class}</td>
                  <td className="px-4 py-3">{reg.depositor_name}</td>
                  <td className={`hud px-4 py-3 ${statusCls[reg.status]}`}>
                    {tMy(`status.${reg.status}`)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {reg.status !== "confirmed" && (
                        <form action={setRegistrationStatus.bind(null, reg.id, "confirmed")}>
                          <button className="btn btn-primary !px-3 py-1.5 text-xs">{t("confirm")}</button>
                        </form>
                      )}
                      {reg.status !== "cancelled" ? (
                        <form action={setRegistrationStatus.bind(null, reg.id, "cancelled")}>
                          <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("cancel")}</button>
                        </form>
                      ) : (
                        <form action={setRegistrationStatus.bind(null, reg.id, "pending")}>
                          <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("restore")}</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 기록 입력 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("recordsTitle")}</h2>
      <div className="card mt-4 p-6">
        <RecordForm
          pilots={(pilots ?? []).map((p) => ({ id: p.id, label: p.name }))}
          events={(events ?? []).map((e) => ({ id: e.id, label: `${e.title} (${e.event_date})` }))}
        />
      </div>

      {/* 최근 기록 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("recentRecords")}</h2>
      <div className="card mt-4 overflow-x-auto">
        {!records?.length ? (
          <p className="p-6 text-sm text-muted">{t("noRecords")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-line/50 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{rec.profile?.name}</td>
                  <td className="hud px-4 py-3 text-muted">{rec.class}</td>
                  <td className="hud px-4 py-3">{formatMs(rec.time_ms)}</td>
                  <td className="hud px-4 py-3 text-muted">
                    {format.dateTime(new Date(rec.flown_on), { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteRecord.bind(null, rec.id)}>
                      <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("delete")}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 소식 작성 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("postsTitle")}</h2>
      <div className="card mt-4 p-6">
        <PostForm />
      </div>

      <h2 className="display mt-14 text-2xl font-bold">{t("recent")}</h2>
      <div className="card mt-4 overflow-x-auto">
        {!posts?.length ? (
          <p className="p-6 text-sm text-muted">{t("none")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-line/50 last:border-b-0">
                  <td className="hud px-4 py-3 text-xs text-accent">{post.category}</td>
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="hud px-4 py-3 text-xs text-muted">
                    {format.dateTime(new Date(post.created_at), { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePost.bind(null, post.id)}>
                      <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("delete")}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 갤러리 업로드 */}
      <h2 className="display mt-14 text-2xl font-bold">{t("galleryTitle")}</h2>
      <div className="card mt-4 p-6">
        <GalleryUploader />
      </div>

      <h2 className="display mt-14 text-2xl font-bold">{t("recentGallery")}</h2>
      {!gallery?.length ? (
        <p className="card mt-4 p-6 text-sm text-muted">{t("noneGallery")}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {gallery.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.caption ?? ""} className="aspect-square w-full object-cover" />
              <form action={deleteGalleryItem.bind(null, item.id)} className="p-2 text-right">
                <button className="btn btn-ghost px-2 py-1 text-xs">{t("delete")}</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
