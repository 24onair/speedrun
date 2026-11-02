import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import PostForm from "../../../../components/admin/PostForm";
import { deletePost } from "../../../../lib/actions/admin";
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
    .select("id, category, title, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h2 className="display text-2xl font-bold">{t("postsTitle")}</h2>
      <div className="card mt-4 p-6">
        <PostForm />
      </div>

      <h2 className="display mt-12 text-2xl font-bold">{t("recent")}</h2>
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
    </div>
  );
}
