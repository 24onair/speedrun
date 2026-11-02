import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "../../../i18n/navigation";
import AdminNav from "../../../components/admin/AdminNav";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";

/* 관리자 공통 레이아웃 — 권한 가드 + 좌측 탭. 데이터 접근은 RLS가 최종 방어 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

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

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow mb-3">RACE CONTROL</p>
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-44 lg:shrink-0">
          <AdminNav />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
