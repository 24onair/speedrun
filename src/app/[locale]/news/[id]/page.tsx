import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { createClient, isSupabaseConfigured } from "../../../../lib/supabase/server";
import { postBody, postTitle, type PostRow } from "../../../../lib/posts";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const format = await getFormatter();

  let post: PostRow | null = null;
  if (isSupabaseConfigured() && /^[0-9a-f-]{36}$/.test(id)) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, category, title, body, title_en, body_en, created_at")
      .eq("id", id)
      .maybeSingle<PostRow>();
    post = data;
  }

  if (!post) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="card max-w-xl p-6 text-sm text-muted">{t("empty")}</p>
        <Link href="/news" className="btn btn-ghost mt-6 text-sm">
          <span aria-hidden>←</span> {t("backToList")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <span className="tag">{t(`categories.${post.category}`)}</span>
      <h1 className="display mt-4 max-w-3xl text-3xl font-bold sm:text-5xl">
        {postTitle(post, locale)}
      </h1>
      <p className="hud mt-3 text-xs text-muted">
        {format.dateTime(new Date(post.created_at), { dateStyle: "long" })}
      </p>
      <div className="mt-8 max-w-2xl whitespace-pre-line leading-relaxed text-fg/90">
        {postBody(post, locale)}
      </div>
      <Link href="/news" className="btn btn-ghost mt-10 text-sm">
        <span aria-hidden>←</span> {t("backToList")}
      </Link>
    </section>
  );
}
