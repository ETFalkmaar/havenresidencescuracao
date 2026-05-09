"use client";

export function PreviewFrame({ iframeKey }: { iframeKey: number }) {
  return (
    <iframe
      key={iframeKey}
      src="/?editorPreview=1"
      title="Site preview"
      className="w-full"
      style={{ height: "calc(100vh - 130px)", border: 0 }}
    />
  );
}
