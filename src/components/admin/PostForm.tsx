"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addPost, type PostState } from "../../lib/actions/admin";

const initial: PostState = { error: null };

export default function PostForm() {
  const t = useTranslations("admin");
  const tNews = useTranslations("news");
  const [state, action, pending] = useActionState(addPost, initial);

  const labelCls = "flex flex-col gap-1.5 text-sm";
  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {t("category")}
          <select name="category" required defaultValue="notice" className={inputCls}>
            {(["notice", "news", "event"] as const).map((c) => (
              <option key={c} value={c}>{tNews(`categories.${c}`)}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t("titleKo")}
          <input name="title" required className={inputCls} />
        </label>
      </div>
      <label className={labelCls}>
        {t("bodyKo")}
        <textarea name="body" required rows={5} className={inputCls} />
      </label>
      <details className="text-sm text-muted">
        <summary className="cursor-pointer py-1">EN</summary>
        <div className="mt-3 flex flex-col gap-4">
          <label className={labelCls}>
            {t("titleEn")}
            <input name="titleEn" className={inputCls} />
          </label>
          <label className={labelCls}>
            {t("bodyEn")}
            <textarea name="bodyEn" rows={5} className={inputCls} />
          </label>
        </div>
      </details>

      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {t.has(`errors.${state.error}`) ? t(`errors.${state.error}` as never) : state.error}
        </p>
      )}
      {state.ok && <p className="text-sm text-good">{t("added")}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-start text-sm disabled:opacity-60">
        {pending ? "…" : t("addBtn")}
      </button>
    </form>
  );
}
