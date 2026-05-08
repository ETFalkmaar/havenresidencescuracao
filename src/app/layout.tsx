import type { Metadata } from "next";
import "./globals.css";
import { loadOverlay } from "@/lib/editor/overrides";
import { isEditorPreview, isEditorOverlayRequested } from "@/lib/editor/mode";
import { EditorOverlay } from "@/components/editor/EditorOverlay";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://havenresidencescuracao.vercel.app",
  ),
  title: {
    default: "Haven Residence — Premium stays on Curaçao",
    template: "%s · Haven Residence",
  },
  description:
    "A curated collection of vacation and long-term residences on the island of Curaçao. Book directly for the best rates and personal service.",
  openGraph: {
    title: "Haven Residence — Premium stays on Curaçao",
    description:
      "A curated collection of vacation and long-term residences on the island of Curaçao.",
    type: "website",
    locale: "en_US",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const editorPreview = await isEditorPreview();
  const overlayActive = await isEditorOverlayRequested();
  const { customCss, customJs } = await loadOverlay(
    editorPreview ? "draft" : "published",
  );

  return (
    <html lang="en">
      <body className="antialiased">
        {customCss ? (
          // Custom CSS from the Ultra editor — placed early so site CSS still
          // wins for properties admins didn't override.
          <style
            id="editor-custom-css"
            dangerouslySetInnerHTML={{ __html: customCss }}
          />
        ) : null}
        {children}
        {customJs ? (
          <script
            id="editor-custom-js"
            dangerouslySetInnerHTML={{ __html: customJs }}
          />
        ) : null}
        {overlayActive ? <EditorOverlay /> : null}
      </body>
    </html>
  );
}
