"use client";

// EditorOverlay
//
// Mounted on the public site when the `editor_overlay` cookie is set.
// Injected into the iframe rendered by /admin/editor.
//
// Responsibilities:
//   - Highlight every element with `data-edit-id` on hover.
//   - Show a floating toolbar with: edit, toggle hidden, replace image, change color, more.
//   - On "edit text" → make the element contenteditable, save on blur via server action.
//   - On "hide" → call saveEdit(prop=hidden, value=true).
//   - On "replace image" → open file picker, upload, save the new URL.
//   - postMessage to the parent window (admin editor) on every save so the
//     version sidebar refreshes.

import { useCallback, useEffect, useRef, useState } from "react";
import { saveEdit, setEditorPreview } from "@/app/admin/editor/actions";

type SelectedEl = {
  el: HTMLElement;
  targetKey: string;
  prop: string;
  rect: DOMRect;
} | null;

type ToolbarAction =
  | "edit"
  | "toggle"
  | "color"
  | "image"
  | "duplicate"
  | "delete"
  | "more";

const HIGHLIGHT_OUTLINE = "2px solid #3b82f6";
const HIGHLIGHT_OUTLINE_OFFSET = "2px";

function ringStyle(active: boolean): React.CSSProperties {
  return {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    border: active ? HIGHLIGHT_OUTLINE : "1px dashed rgba(59,130,246,0.45)",
    outlineOffset: HIGHLIGHT_OUTLINE_OFFSET,
    zIndex: 99998,
  };
}

export function EditorOverlay() {
  const [hovered, setHovered] = useState<SelectedEl>(null);
  const [selected, setSelected] = useState<SelectedEl>(null);
  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recompute rect when selected/hovered changes — we measure on demand.
  const measure = useCallback((el: HTMLElement) => el.getBoundingClientRect(), []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const editable = t.closest<HTMLElement>("[data-edit-id]");
      if (!editable) {
        setHovered(null);
        return;
      }
      const targetKey = editable.dataset.editId!;
      const prop = editable.dataset.editProp ?? "text";
      setHovered({ el: editable, targetKey, prop, rect: measure(editable) });
    }
    function onScroll() {
      setHovered((h) => (h ? { ...h, rect: measure(h.el) } : h));
      setSelected((s) => (s ? { ...s, rect: measure(s.el) } : s));
    }
    function onResize() {
      setHovered((h) => (h ? { ...h, rect: measure(h.el) } : h));
      setSelected((s) => (s ? { ...s, rect: measure(s.el) } : s));
    }
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [measure]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Don't intercept clicks on overlay UI itself
      if (t.closest("[data-editor-ui]")) return;
      const editable = t.closest<HTMLElement>("[data-edit-id]");
      if (!editable) {
        setSelected(null);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const targetKey = editable.dataset.editId!;
      const prop = editable.dataset.editProp ?? "text";
      setSelected({ el: editable, targetKey, prop, rect: measure(editable) });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [measure]);

  function notifyParent(payload: Record<string, unknown>) {
    try {
      window.parent?.postMessage({ source: "haven-editor", ...payload }, "*");
    } catch {
      // ignore
    }
  }

  const flash = useCallback((msg: string, ms = 1800) => {
    setSavingMsg(msg);
    setTimeout(() => setSavingMsg(null), ms);
  }, []);

  // ---------- Action handlers ----------
  async function performSave(
    targetKey: string,
    prop: string,
    value: unknown,
    changeType: "text" | "image" | "color" | "visibility" | "layout",
    description: string,
  ) {
    setBusy(true);
    setError(null);
    const result = await saveEdit(targetKey, prop, value, changeType, description);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    flash("Saved");
    notifyParent({ type: "saved", targetKey, prop });
    return true;
  }

  async function actEdit(sel: NonNullable<SelectedEl>) {
    // Inline contenteditable on the element itself.
    const original = sel.el.innerText;
    sel.el.contentEditable = "true";
    sel.el.style.outline = HIGHLIGHT_OUTLINE;
    sel.el.style.outlineOffset = HIGHLIGHT_OUTLINE_OFFSET;
    sel.el.focus();
    // Place caret at the end
    const range = document.createRange();
    range.selectNodeContents(sel.el);
    range.collapse(false);
    const sel0 = window.getSelection();
    sel0?.removeAllRanges();
    sel0?.addRange(range);

    const cleanup = async () => {
      sel.el.removeEventListener("blur", onBlur);
      sel.el.removeEventListener("keydown", onKey);
      sel.el.contentEditable = "false";
      sel.el.style.outline = "";
      sel.el.style.outlineOffset = "";
    };
    const onBlur = async () => {
      const text = sel.el.innerText.trim();
      await cleanup();
      if (text === original) return;
      await performSave(sel.targetKey, sel.prop, text, "text", `Edited "${sel.targetKey}.${sel.prop}"`);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sel.el.innerText = original;
        sel.el.blur();
      }
      if (e.key === "Enter" && !e.shiftKey && sel.el.tagName !== "TEXTAREA") {
        e.preventDefault();
        sel.el.blur();
      }
    };
    sel.el.addEventListener("blur", onBlur);
    sel.el.addEventListener("keydown", onKey);
  }

  async function actToggleHidden(sel: NonNullable<SelectedEl>) {
    // Toggle visibility — write to `hidden` prop on this target.
    // After this the SSR will skip the section, so the user sees it disappear
    // on the next refresh; we also hide it client-side immediately for feedback.
    const ok = await performSave(
      sel.targetKey,
      "hidden",
      true,
      "visibility",
      `Hidden ${sel.targetKey}`,
    );
    if (ok) {
      sel.el.style.display = "none";
      setSelected(null);
    }
  }

  async function actDelete(sel: NonNullable<SelectedEl>) {
    // For most elements "delete" === permanent hide. We don't actually delete data.
    if (!confirm("Hide this element from the live site?")) return;
    await actToggleHidden(sel);
  }

  function actDuplicate() {
    // Duplication of arbitrary DOM is risky (it'd diverge from data). Tell the
    // user this isn't supported for arbitrary elements yet.
    setError(
      "Duplicate is only available for repeating sections (e.g. residences). Use the residence list in admin → properties to duplicate listings.",
    );
  }

  async function actColor(sel: NonNullable<SelectedEl>) {
    // Open a hidden color input.
    const input = document.createElement("input");
    input.type = "color";
    input.value = "#1e5fbf";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.click();
    const onChange = async () => {
      input.removeEventListener("change", onChange);
      const hex = input.value;
      input.remove();
      await performSave(sel.targetKey, "color_hex", hex, "color", `Color → ${hex}`);
    };
    input.addEventListener("change", onChange);
  }

  function actImage(sel: NonNullable<SelectedEl>) {
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.targetKey = sel.targetKey;
    fileInputRef.current.dataset.prop =
      sel.prop === "hidden" ? "hero_image_url" : sel.prop || "imageUrl";
    fileInputRef.current.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const targetKey = e.target.dataset.targetKey;
    const prop = e.target.dataset.prop ?? "imageUrl";
    if (!targetKey) return;

    setBusy(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext)
        ? ext
        : "jpg";
      const path = `editor/${crypto.randomUUID()}.${safeExt}`;
      const { error: upErr } = await supabase.storage
        .from("property-media")
        .upload(path, file, {
          contentType: file.type || `image/${safeExt}`,
          upsert: false,
        });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from("property-media").getPublicUrl(path);
      await performSave(targetKey, prop, pub.publicUrl, "image", `Replaced image on ${targetKey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function exitEditorMode() {
    await setEditorPreview(false);
    document.cookie = "editor_overlay=; path=/; max-age=0";
    notifyParent({ type: "exit" });
    window.location.reload();
  }

  // ---------- Render ----------
  return (
    <>
      {/* Hover ring */}
      {hovered && hovered !== selected ? (
        <FloatingFrame rect={hovered.rect}>
          <div style={ringStyle(false)} />
          <div
            data-editor-ui
            style={{
              position: "absolute",
              top: "-22px",
              left: 0,
              fontSize: 10,
              padding: "2px 6px",
              background: "#3b82f6",
              color: "white",
              borderRadius: 4,
              fontFamily: "ui-sans-serif, system-ui",
              pointerEvents: "none",
            }}
          >
            {hovered.targetKey}
          </div>
        </FloatingFrame>
      ) : null}

      {/* Selected ring + toolbar */}
      {selected ? (
        <FloatingFrame rect={selected.rect}>
          <div style={ringStyle(true)} />
          <Toolbar
            targetKey={selected.targetKey}
            prop={selected.prop}
            busy={busy}
            onAction={(a) => {
              const sel = selected;
              if (!sel) return;
              if (a === "edit") return actEdit(sel);
              if (a === "toggle") return actToggleHidden(sel);
              if (a === "delete") return actDelete(sel);
              if (a === "color") return actColor(sel);
              if (a === "image") return actImage(sel);
              if (a === "duplicate") return actDuplicate();
              if (a === "more") {
                notifyParent({
                  type: "openPanel",
                  targetKey: sel.targetKey,
                  prop: sel.prop,
                });
              }
            }}
            onClose={() => setSelected(null)}
          />
        </FloatingFrame>
      ) : null}

      {/* Hidden file input for image replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChosen}
        data-editor-ui
      />

      {/* Top status bar */}
      <div
        data-editor-ui
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: "rgba(15,23,42,0.92)",
          color: "white",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "ui-sans-serif, system-ui",
          fontSize: 12,
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ fontWeight: 600 }}>● Editor mode</span>
        <span style={{ opacity: 0.7 }}>
          Hover an element and click to edit. Click outside to deselect.
        </span>
        <span style={{ flex: 1 }} />
        {savingMsg ? (
          <span style={{ color: "#34d399" }}>✓ {savingMsg}</span>
        ) : null}
        {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
        {busy ? <span style={{ opacity: 0.7 }}>Saving…</span> : null}
        <button
          type="button"
          onClick={exitEditorMode}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            padding: "4px 10px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          Exit
        </button>
      </div>

      {/* Top-margin spacer so the status bar doesn't cover the page */}
      <div data-editor-ui style={{ height: 36 }} />
    </>
  );
}

function FloatingFrame({
  rect,
  children,
}: {
  rect: DOMRect;
  children: React.ReactNode;
}) {
  return (
    <div
      data-editor-ui
      style={{
        position: "absolute",
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        zIndex: 99998,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

const TOOLBAR_BTN: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "none",
  width: 32,
  height: 32,
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function Toolbar({
  targetKey,
  prop,
  busy,
  onAction,
  onClose,
}: {
  targetKey: string;
  prop: string;
  busy: boolean;
  onAction: (a: ToolbarAction) => void;
  onClose: () => void;
}) {
  return (
    <div
      data-editor-ui
      style={{
        position: "absolute",
        top: -44,
        left: 0,
        zIndex: 99999,
        display: "flex",
        gap: 4,
        padding: 4,
        background: "rgba(15,23,42,0.96)",
        borderRadius: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        title={`Edit text (${targetKey})`}
        onClick={() => onAction("edit")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Edit text"
      >
        ✏️
      </button>
      <button
        type="button"
        title={prop === "hidden" ? "Hide section" : "Hide element"}
        onClick={() => onAction("toggle")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Hide"
      >
        👁
      </button>
      <button
        type="button"
        title="Replace image"
        onClick={() => onAction("image")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Replace image"
      >
        🖼
      </button>
      <button
        type="button"
        title="Change color"
        onClick={() => onAction("color")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Change color"
      >
        🎨
      </button>
      <button
        type="button"
        title="Duplicate"
        onClick={() => onAction("duplicate")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Duplicate"
      >
        📋
      </button>
      <button
        type="button"
        title="Delete (hide permanently)"
        onClick={() => onAction("delete")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Delete"
      >
        🗑
      </button>
      <button
        type="button"
        title="Open advanced settings"
        onClick={() => onAction("more")}
        style={TOOLBAR_BTN}
        disabled={busy}
        aria-label="Advanced"
      >
        ⚙
      </button>
      <span style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
      <button
        type="button"
        title="Close toolbar"
        onClick={onClose}
        style={TOOLBAR_BTN}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
