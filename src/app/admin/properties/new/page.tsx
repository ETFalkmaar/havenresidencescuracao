import Link from "next/link";
import { NewPropertyForm } from "./NewPropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/admin/properties"
        className="text-xs uppercase tracking-[0.3em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
      >
        ← All residences
      </Link>
      <h1 className="text-3xl font-extralight mt-4">Add a new residence</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-10">
        Quick-create with the basics. You can fill in everything else right
        after — photos, units, pricing, amenities.
      </p>
      <NewPropertyForm />
    </main>
  );
}
