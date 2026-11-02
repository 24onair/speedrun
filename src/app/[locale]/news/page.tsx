import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
import { postBody, postTitle, type PostRow } from "../../../lib/posts";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const format = await getFormatter();

  let posts: PostRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, category, title, body, title_en, body_en, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<PostRow[]>();
    posts = data ?? [];
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow mb-3">{t("label")}</p>
      <h1 className="display text-4xl font-bold sm:text-5xl">{t("title")}</h1>

      {!posts.length ? (
        <p className="card mt-8 max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="card group p-6 transition-colors hover:border-accent"
            >
              <span className="tag">{t(`categories.${post.category}`)}</span>
              <p className="mt-4 font-bold leading-snug group-hover:text-accent">
                {postTitle(post, locale)}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {postBody(post, locale)}
              </p>
              <p className="hud mt-3 text-xs text-muted">
                {format.dateTime(new Date(post.created_at), { dateStyle: "medium" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
