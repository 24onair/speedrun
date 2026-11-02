export type PostRow = {
  id: string;
  category: "notice" | "news" | "event";
  title: string;
  body: string;
  title_en: string | null;
  body_en: string | null;
  created_at: string;
};

export function postTitle(post: PostRow, locale: string) {
  return locale === "en" && post.title_en ? post.title_en : post.title;
}

export function postBody(post: PostRow, locale: string) {
  return locale === "en" && post.body_en ? post.body_en : post.body;
}
