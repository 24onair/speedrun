"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signUp, type AuthState } from "../../lib/actions/auth";

const initial: AuthState = { error: null };

export default function SignupForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signUp, initial);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        {t("name")}
        <input name="name" required autoComplete="name"
          className="card px-4 py-3 text-base outline-none focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("phone")}
        <input name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000"
          className="card px-4 py-3 text-base outline-none focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("email")}
        <input name="email" type="email" required autoComplete="email"
          className="card px-4 py-3 text-base outline-none focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("password")}
        <input name="password" type="password" required minLength={6} autoComplete="new-password"
          className="card px-4 py-3 text-base outline-none focus:border-accent" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {t.has(`errors.${state.error}`) ? t(`errors.${state.error}` as never) : state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary mt-2 justify-center disabled:opacity-60">
        {pending ? "…" : t("signupBtn")}
      </button>
    </form>
  );
}
