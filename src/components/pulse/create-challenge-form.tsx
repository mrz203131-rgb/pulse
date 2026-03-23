"use client";

import { useState } from "react";
import {
  challengeCategoryOptions,
  type ChallengeFormValues,
  challengeFrequencyOptions,
  challengeVisibilityOptions,
  getFrequencyLabel,
  getInitialChallengeFormValues,
  getVisibilityLabel,
} from "@/lib/challenge-config";
import type { ChallengeFormErrors } from "@/lib/challenges";

type CreateChallengeFormProps = {
  isSignedIn: boolean;
};

type CreateChallengeResponse = {
  redirectTo?: string;
  formError?: string;
  fieldErrors?: ChallengeFormErrors;
  values?: ChallengeFormValues;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function CreateChallengeForm({ isSignedIn }: CreateChallengeFormProps) {
  const [values, setValues] = useState<ChallengeFormValues>(getInitialChallengeFormValues());
  const [fieldErrors, setFieldErrors] = useState<ChallengeFormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setFormError(undefined);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/challenges/create", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as CreateChallengeResponse;

      if (payload.values) {
        setValues(getInitialChallengeFormValues(payload.values));
      }

      if (payload.fieldErrors) {
        setFieldErrors(payload.fieldErrors);
      } else {
        setFieldErrors({});
      }

      if (payload.formError) {
        setFormError(payload.formError);
      }

      if (payload.redirectTo) {
        window.location.href = payload.redirectTo;
        return;
      }
    } catch {
      setFormError("Pulse couldn't reach the challenge service. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <div className="rounded-[26px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            type="text"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Sunday soft reset challenge"
            className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
          <FieldError message={fieldErrors.title} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={4}
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            placeholder="Set a mood, a tiny rule, and the kind of check-in people should post."
            className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
          <FieldError message={fieldErrors.description} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              name="category"
              value={values.category}
              onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            >
              {challengeCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.category} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Cover image URL</span>
            <input
              name="coverImageUrl"
              type="url"
              value={values.coverImageUrl}
              onChange={(event) => setValues((current) => ({ ...current, coverImageUrl: event.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            />
            <FieldError message={fieldErrors.coverImageUrl} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Visibility</span>
            <select
              name="visibility"
              value={values.visibility}
              onChange={(event) => setValues((current) => ({ ...current, visibility: event.target.value as ChallengeFormValues["visibility"] }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            >
              {challengeVisibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {getVisibilityLabel(option)}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-slate-500">
              Friends visibility currently uses a signed-in placeholder until a real friends graph exists.
            </p>
            <FieldError message={fieldErrors.visibility} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Frequency</span>
            <select
              name="frequencyType"
              value={values.frequencyType}
              onChange={(event) => setValues((current) => ({ ...current, frequencyType: event.target.value as ChallengeFormValues["frequencyType"] }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            >
              {challengeFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {getFrequencyLabel(option, Number.parseInt(values.targetCount || "1", 10) || 1)}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.frequencyType} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Target count</span>
            <input
              name="targetCount"
              type="number"
              min={1}
              max={365}
              value={values.targetCount}
              onChange={(event) => setValues((current) => ({ ...current, targetCount: event.target.value }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            />
            <FieldError message={fieldErrors.targetCount} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Start date</span>
            <input
              name="startDate"
              type="date"
              value={values.startDate}
              onChange={(event) => setValues((current) => ({ ...current, startDate: event.target.value }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            />
            <FieldError message={fieldErrors.startDate} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">End date</span>
            <input
              name="endDate"
              type="date"
              value={values.endDate}
              onChange={(event) => setValues((current) => ({ ...current, endDate: event.target.value }))}
              className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
            />
            <FieldError message={fieldErrors.endDate} />
          </label>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-[28px] border border-white/70 bg-white/90 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-slate-900">Save as reusable template</p>
            <p className="text-xs leading-5 text-slate-500">Mark this so the structure can be reused later.</p>
          </div>
          <input
            name="isTemplate"
            type="checkbox"
            checked={values.isTemplate}
            onChange={(event) => setValues((current) => ({ ...current, isTemplate: event.target.checked }))}
            className="size-5 rounded border-slate-300 text-[var(--color-accent-strong)]"
          />
        </label>
      </div>

      <div className="rounded-[30px] bg-[linear-gradient(135deg,rgba(255,117,92,0.12),rgba(255,255,255,0.96),rgba(72,195,177,0.14))] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{isSignedIn ? "Ready to publish" : "Sign in required"}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {isSignedIn
                ? "Publishing saves the challenge locally and auto-joins you as the creator."
                : "You can draft the form now, but publishing redirects through auth if you are not signed in."}
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Publishing..." : "Publish challenge"}
          </button>
        </div>
      </div>
    </form>
  );
}
