"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type AuthState } from "../../lib/actions/auth";

const initial: AuthState = { error: null };

export default function LoginForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        {t("email")}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="card px-4 py-3 text-base outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("password")}
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="card px-4 py-3 text-base outline-none focus:border-accent"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {t.has(`errors.${state.error}`) ? t(`errors.${state.error}` as never) : state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary mt-2 justify-center disabled:opacity-60">
        {pending ? "…" : t("loginBtn")}
      </button>
    </form>
  );
}
