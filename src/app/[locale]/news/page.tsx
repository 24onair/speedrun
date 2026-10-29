import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import ComingSoon from "../../../components/ComingSoon";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ComingSoon pageKey="news" />;
}
