"use client";

import { useState } from "react";
import { getInitialCheckInValues, type CheckInFormValues } from "@/lib/check-in-config";
import type { CheckInFormErrors } from "@/lib/check-ins";

type CheckInComposerProps = {
  challengeId: string;
  canPost: boolean;
};

type CheckInResponse = {
  redirectTo?: string;
  formError?: string;
  fieldErrors?: CheckInFormErrors;
  values?: CheckInFormValues;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function CheckInComposer({ challengeId, canPost }: CheckInComposerProps) {
  const [values, setValues] = useState<CheckInFormValues>(getInitialCheckInValues(challengeId));
  const [fieldErrors, setFieldErrors] = useState<CheckInFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canPost) {
      return;
    }

    setIsPending(true);
    setFormError(undefined);
    setSuccessMessage(undefined);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/check-ins/create", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as CheckInResponse;

      if (payload.values) {
        setValues(payload.values);
      }

      setFieldErrors(payload.fieldErrors ?? {});

      if (payload.formError) {
        setFormError(payload.formError);
      }

      if (payload.redirectTo) {
        setSuccessMessage("Check-in saved. Refreshing the challenge...");
        window.location.href = payload.redirectTo;
      }
    } catch {
      setFormError("Pulse couldn't reach the check-in service. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="challengeId" value={challengeId} />
      {formError ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Image URL</span>
        <input
          name="imageUrl"
          type="url"
          value={values.imageUrl}
          onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
          placeholder="https://images.unsplash.com/..."
          disabled={!canPost || isPending}
          className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError message={fieldErrors.imageUrl} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Caption</span>
        <textarea
          name="caption"
          rows={3}
          value={values.caption}
          onChange={(event) => setValues((current) => ({ ...current, caption: event.target.value }))}
          placeholder="Golden hour loop done. Posted the softest skyline frame and called it a win."
          disabled={!canPost || isPending}
          className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError message={fieldErrors.caption} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Check-in date</span>
        <input
          name="checkInDate"
          type="date"
          value={values.checkInDate}
          onChange={(event) => setValues((current) => ({ ...current, checkInDate: event.target.value }))}
          disabled={!canPost || isPending}
          className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError message={fieldErrors.checkInDate} />
      </label>
      <button
        type="submit"
        disabled={!canPost || isPending}
        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Posting..." : "Post check-in"}
      </button>
    </form>
  );
}
