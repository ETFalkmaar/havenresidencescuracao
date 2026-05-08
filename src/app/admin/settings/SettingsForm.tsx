"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "./actions";

type Settings = {
  brand_name: string;
  brand_tagline: string | null;
  brand_tagline_nl: string | null;
  brand_description: string | null;
  brand_description_nl: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  emergency_phone: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_review_url: string | null;
  trustpilot_url: string | null;
};

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  textarea = false,
  hint,
  placeholder,
  required = false,
}: {
  name: keyof Settings;
  label: string;
  defaultValue: string | null;
  type?: string;
  textarea?: boolean;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={3}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      )}
      {hint && <p className="text-xs text-neutral-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setErrorMsg(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateSiteSettings(formData);
          if (result.ok) setStatus("ok");
          else {
            setStatus("error");
            setErrorMsg(result.error);
          }
        });
      }}
    >
      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Brand
        </h2>
        <Field
          name="brand_name"
          label="Brand name"
          defaultValue={settings.brand_name}
          required
        />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            name="brand_tagline"
            label="Tagline (EN)"
            defaultValue={settings.brand_tagline}
            placeholder="Premium stays on the island of Curaçao"
          />
          <Field
            name="brand_tagline_nl"
            label="Tagline (NL)"
            defaultValue={settings.brand_tagline_nl}
            placeholder="Premium verblijven op het eiland Curaçao"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            name="brand_description"
            label="Short description (EN)"
            defaultValue={settings.brand_description}
            textarea
            hint="Shown in the about section on the homepage."
          />
          <Field
            name="brand_description_nl"
            label="Short description (NL)"
            defaultValue={settings.brand_description_nl}
            textarea
            hint="Getoond in de over-sectie op de homepage."
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Contact
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            name="contact_email"
            label="Email"
            type="email"
            defaultValue={settings.contact_email}
            placeholder="info@havenresidencescuracao.com"
          />
          <Field
            name="whatsapp_number"
            label="WhatsApp number"
            defaultValue={settings.whatsapp_number}
            placeholder="+5999 555 1234"
            hint="Used for guest WhatsApp links and confirmation emails."
          />
        </div>
        <Field
          name="emergency_phone"
          label="24/7 emergency phone"
          defaultValue={settings.emergency_phone}
          placeholder="+5999 555 0000"
        />
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Social
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            name="instagram_url"
            label="Instagram URL"
            type="url"
            defaultValue={settings.instagram_url}
            placeholder="https://instagram.com/…"
          />
          <Field
            name="tiktok_url"
            label="TikTok URL"
            type="url"
            defaultValue={settings.tiktok_url}
            placeholder="https://tiktok.com/@…"
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Reviews
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            name="google_review_url"
            label="Google review URL"
            type="url"
            defaultValue={settings.google_review_url}
            placeholder="https://g.page/r/…/review"
          />
          <Field
            name="trustpilot_url"
            label="Trustpilot URL"
            type="url"
            defaultValue={settings.trustpilot_url}
            placeholder="https://trustpilot.com/review/…"
          />
        </div>
      </section>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Saved.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? "Could not save."}
          </span>
        )}
      </div>
    </form>
  );
}
