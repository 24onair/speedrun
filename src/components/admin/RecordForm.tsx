"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addRecord, type RecordState } from "../../lib/actions/admin";
import { CLASSES } from "../../lib/register-constants";

const initial: RecordState = { error: null };

type Option = { id: string; label: string };

export default function RecordForm({
  pilots,
  events,
}: {
  pilots: Option[];
  events: Option[];
}) {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(addRecord, initial);

  const labelCls = "flex flex-col gap-1.5 text-sm";
  const inputCls = "card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {t("pilot")}
          <select name="pilotId" required className={inputCls} defaultValue="">
            <option value="" disabled />
            {pilots.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t("event")}
          <select name="eventId" required className={inputCls} defaultValue="">
            <option value="" disabled />
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t("classLabel")}
          <select name="class" required className={inputCls} defaultValue="">
            <option value="" disabled />
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t("time")}
          <input
            name="time"
            required
            placeholder="00:34:44"
            pattern="^\d{1,2}:\d{1,2}(:\d{1,2})?$"
            className={`${inputCls} hud`}
          />
        </label>
        <label className={labelCls}>
          {t("flownOn")}
          <input name="flownOn" type="date" className={inputCls} />
        </label>
        <label className={labelCls}>
          {t("note")}
          <input name="note" className={inputCls} />
        </label>
      </div>

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
