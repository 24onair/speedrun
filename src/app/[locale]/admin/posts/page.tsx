import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import PostAdminRow from "../../../../components/admin/PostAdminRow";
import PostForm from "../../../../components/admin/PostForm";
import { createClient } from "../../../../lib/supabase/server";

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, category, title, body, title_en, body_en, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("postsTitle")}</h2>
      <div className="card mt-4 p-6">
        <PostForm />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("recent")}</h2>
      <div className="card mt-4">
        {!posts?.length ? (
          <p className="p-6 text-sm text-muted">{t("none")}</p>
        ) : (
          posts.map((post) => (
            <PostAdminRow
              key={post.id}
              post={{
                id: post.id,
                category: post.category as "notice" | "news" | "event",
                title: post.title,
                body: post.body,
                titleEn: post.title_en ?? "",
                bodyEn: post.body_en ?? "",
                dateLabel: format.dateTime(new Date(post.created_at), { dateStyle: "medium" }),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
