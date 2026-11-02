"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { deletePost, updatePost, type PostState } from "../../lib/actions/admin";

export type PostAdminItem = {
  id: string;
  category: "notice" | "news" | "event";
  title: string;
  body: string;
  titleEn: string;
  bodyEn: string;
  dateLabel: string;
};

const initial: PostState = { error: null };

/* 관리자 소식 행 — 펼쳐서 수정 (영문 비우면 자동 재번역) */
export default function PostAdminRow({ post }: { post: PostAdminItem }) {
  const t = useTranslations("admin");
  const tNews = useTranslations("news");
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updatePost, initial);

  const labelCls = "flex flex-col gap-1.5 text-sm";
  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <div className="border-b border-line/50 last:border-b-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="hud shrink-0 text-xs text-accent">{post.category}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{post.title}</span>
        <span className="hud shrink-0 text-xs text-muted">{post.dateLabel}</span>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => setEditing((v) => !v)} className="btn btn-ghost px-3 py-1.5 text-xs">
            {editing ? t("editCancel") : t("edit")}
          </button>
          <form action={deletePost.bind(null, post.id)}>
            <button className="btn btn-ghost px-3 py-1.5 text-xs">{t("delete")}</button>
          </form>
        </div>
      </div>

      {editing && (
        <form action={action} className="flex flex-col gap-4 border-t border-line/50 bg-bg-deep/40 p-4">
          <input type="hidden" name="id" value={post.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              {t("category")}
              <select name="category" required defaultValue={post.category} className={inputCls}>
                {(["notice", "news", "event"] as const).map((c) => (
                  <option key={c} value={c}>{tNews(`categories.${c}`)}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              {t("titleKo")}
              <input name="title" required defaultValue={post.title} className={inputCls} />
            </label>
          </div>
          <label className={labelCls}>
            {t("bodyKo")}
            <textarea name="body" required rows={5} defaultValue={post.body} className={inputCls} />
          </label>
          <details className="text-sm text-muted" open={Boolean(post.titleEn || post.bodyEn)}>
            <summary className="cursor-pointer py-1">{t("enAuto")}</summary>
            <div className="mt-3 flex flex-col gap-4">
              <label className={labelCls}>
                {t("titleEn")}
                <input name="titleEn" defaultValue={post.titleEn} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t("bodyEn")}
                <textarea name="bodyEn" rows={5} defaultValue={post.bodyEn} className={inputCls} />
              </label>
            </div>
          </details>

          {state.error && (
            <p role="alert" className="text-sm text-accent">
              {t.has(`errors.${state.error}`) ? t(`errors.${state.error}` as never) : state.error}
            </p>
          )}
          {state.ok && <p className="text-sm text-good">{t("saved")}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn btn-primary text-sm disabled:opacity-60">
              {pending ? "…" : t("save")}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost text-sm">
              {t("editCancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
