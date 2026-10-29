"use client";

import { useActionState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  CHECKLIST_KEYS,
  CLASSES,
  submitRegistration,
  type RegisterState,
} from "../../lib/actions/register";

const initial: RegisterState = { error: null };

type Profile = {
  org: string | null;
  glider: string | null;
  license: string | null;
  class: string | null;
  name: string;
};

type EventRow = { id: string; title: string; event_date: string };

export default function RegisterForm({
  event,
  profile,
}: {
  event: EventRow;
  profile: Profile;
}) {
  const t = useTranslations("register");
  const format = useFormatter();
  const [state, action, pending] = useActionState(submitRegistration, initial);

  const sectionCls = "card flex flex-col gap-4 p-6";
  const labelCls = "flex flex-col gap-1.5 text-sm";
  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";
  const checkCls = "flex items-start gap-3 text-sm leading-relaxed";

  return (
    <form action={action} className="mt-10 flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="eventId" value={event.id} />

      <p className="hud text-sm text-muted">
        {t("eventLabel")} —{" "}
        <span className="text-fg">
          {event.title} ·{" "}
          {format.dateTime(new Date(event.event_date), {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </p>

      {/* 1. 클래스 */}
      <fieldset className={sectionCls}>
        <legend className="display float-left mb-2 text-xl font-bold">{t("stepClass")}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {CLASSES.map((cls) => (
            <label
              key={cls}
              className="flex cursor-pointer items-center gap-3 rounded border border-line p-4 transition-colors has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="class"
                value={cls}
                required
                defaultChecked={profile.class === cls}
                className="accent-[color:var(--accent)]"
              />
              <span className="display text-lg font-bold">{cls}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 2. 선수 정보 */}
      <fieldset className={sectionCls}>
        <legend className="display float-left mb-2 text-xl font-bold">{t("stepPilot")}</legend>
        <label className={labelCls}>
          {t("org")}
          <input name="org" defaultValue={profile.org ?? ""} className={inputCls} />
        </label>
        <label className={labelCls}>
          {t("glider")}
          <input name="glider" required defaultValue={profile.glider ?? ""} className={inputCls} />
        </label>
        <label className={labelCls}>
          {t("license")}
          <input name="license" required defaultValue={profile.license ?? ""} className={inputCls} />
        </label>
      </fieldset>

      {/* 3. 장비·자격 체크리스트 */}
      <fieldset className={sectionCls}>
        <legend className="display float-left mb-2 text-xl font-bold">{t("stepChecklist")}</legend>
        <p className="text-sm text-muted">{t("checklistLead")}</p>
        {CHECKLIST_KEYS.map((key) => (
          <label key={key} className={checkCls}>
            <input type="checkbox" name={`check_${key}`} required className="mt-1 accent-[color:var(--accent)]" />
            {t(`checklist.${key}`)}
          </label>
        ))}
      </fieldset>

      {/* 4. 동의 */}
      <fieldset className={sectionCls}>
        <legend className="display float-left mb-2 text-xl font-bold">{t("stepAgree")}</legend>
        {(["agree_waiver", "agree_privacy", "agree_media"] as const).map((key) => (
          <label key={key} className={checkCls}>
            <input type="checkbox" name={key} required className="mt-1 accent-[color:var(--accent)]" />
            {t(key === "agree_waiver" ? "agreeWaiver" : key === "agree_privacy" ? "agreePrivacy" : "agreeMedia")}
          </label>
        ))}
      </fieldset>

      {/* 5. 입금 */}
      <fieldset className={sectionCls}>
        <legend className="display float-left mb-2 text-xl font-bold">{t("stepPay")}</legend>
        <p className="text-sm leading-relaxed text-muted">{t("feeNotice")}</p>
        <p className="hud rounded border border-accent/40 bg-accent/10 p-4 text-sm text-fg">
          {t("bankAccount")}
        </p>
        <label className={labelCls}>
          {t("depositorName")}
          <input name="depositorName" required defaultValue={profile.name} className={inputCls} />
        </label>
      </fieldset>

      {state.error && (
        <p role="alert" className="card border-accent/60 p-4 text-sm text-accent">
          {t.has(`errors.${state.error}`) ? t(`errors.${state.error}` as never) : state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary justify-center py-4 text-base disabled:opacity-60">
        {pending ? "…" : t("submit")}
      </button>
    </form>
  );
}
