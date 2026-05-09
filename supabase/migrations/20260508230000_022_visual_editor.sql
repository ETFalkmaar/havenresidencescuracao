-- ============================================================================
-- Migration 022 — Visual website editor
--
-- Overlay/override-based model:
--   site_edits          one row per (target_key, prop) holding draft + published value
--   site_versions       full snapshot of all published overrides + ultra config
--   site_action_log     append-only audit trail of every editor action (multi-admin)
--   site_ultra_config   single-row table for Ultra-Professional features
--
-- The public site reads `published_value` of site_edits (RLS allows anon).
-- The editor preview reads `draft_value`. Publishing copies draft → published
-- and writes a snapshot row to site_versions.
-- ============================================================================

-- ============ site_edits ============
CREATE TABLE public.site_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_key text NOT NULL,
  prop text NOT NULL,
  draft_value jsonb,
  published_value jsonb,
  draft_updated_at timestamptz NOT NULL DEFAULT now(),
  draft_updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (target_key, prop)
);
CREATE INDEX site_edits_target_idx ON public.site_edits(target_key);
CREATE INDEX site_edits_published_idx ON public.site_edits(published_at)
  WHERE published_value IS NOT NULL;

-- ============ site_versions ============
CREATE TABLE public.site_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text,
  description text NOT NULL,
  change_type text NOT NULL,       -- text | image | color | layout | visibility | css | js | restore | publish | mixed
  snapshot jsonb NOT NULL,         -- { edits: [{target_key, prop, value}, ...], custom_css, custom_js, head_html }
  custom_css text,
  custom_js text,
  head_html text,
  thumbnail_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX site_versions_created_at_idx ON public.site_versions(created_at DESC);
CREATE INDEX site_versions_pinned_idx ON public.site_versions(is_pinned)
  WHERE is_pinned = true;

-- ============ site_action_log ============
CREATE TABLE public.site_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_key text,
  prop text,
  action text NOT NULL,            -- update | hide | show | delete | restore | publish | css | js | template
  change_type text NOT NULL,       -- text | image | color | layout | visibility | css | js | mixed
  description text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  version_id uuid REFERENCES public.site_versions(id) ON DELETE SET NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_email text          -- denormalised so deleted users still attribute correctly
);
CREATE INDEX site_action_log_performed_at_idx ON public.site_action_log(performed_at DESC);
CREATE INDEX site_action_log_performed_by_idx ON public.site_action_log(performed_by);
CREATE INDEX site_action_log_change_type_idx ON public.site_action_log(change_type);

-- ============ site_ultra_config (single row) ============
CREATE TABLE public.site_ultra_config (
  id int PRIMARY KEY DEFAULT 1,
  custom_css_draft text,
  custom_css_published text,
  custom_js_draft text,
  custom_js_published text,
  head_html_draft text,
  head_html_published text,
  ab_tests jsonb NOT NULL DEFAULT '[]'::jsonb,
  templates jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CHECK (id = 1)
);
INSERT INTO public.site_ultra_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============ RLS ============
ALTER TABLE public.site_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_ultra_config ENABLE ROW LEVEL SECURITY;

-- Public can SELECT the published values (anon reads on the live site need this).
CREATE POLICY "site_edits public read published" ON public.site_edits
  FOR SELECT USING (published_value IS NOT NULL OR public.is_admin());

CREATE POLICY "site_edits admin write" ON public.site_edits
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "site_versions admin all" ON public.site_versions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "site_action_log admin all" ON public.site_action_log
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Ultra config: published CSS/JS must be readable by anon (loaded into <head> of public site).
CREATE POLICY "site_ultra_config public read" ON public.site_ultra_config
  FOR SELECT USING (true);

CREATE POLICY "site_ultra_config admin write" ON public.site_ultra_config
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ Helper RPCs ============

-- Save (upsert) a single override into draft. Returns the new value.
CREATE OR REPLACE FUNCTION public.editor_save_draft(
  p_target_key text,
  p_prop text,
  p_value jsonb,
  p_change_type text,
  p_description text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_old jsonb;
  v_email text;
  v_uid uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  v_uid := auth.uid();
  SELECT email INTO v_email FROM public.admin_users WHERE user_id = v_uid;

  SELECT draft_value INTO v_old
  FROM public.site_edits
  WHERE target_key = p_target_key AND prop = p_prop;

  INSERT INTO public.site_edits (target_key, prop, draft_value, draft_updated_at, draft_updated_by)
  VALUES (p_target_key, p_prop, p_value, now(), v_uid)
  ON CONFLICT (target_key, prop) DO UPDATE SET
    draft_value = EXCLUDED.draft_value,
    draft_updated_at = now(),
    draft_updated_by = v_uid;

  INSERT INTO public.site_action_log (
    target_key, prop, action, change_type, description,
    old_value, new_value, performed_by, performed_by_email
  ) VALUES (
    p_target_key, p_prop, 'update', p_change_type, p_description,
    v_old, p_value, v_uid, v_email
  );

  RETURN p_value;
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_save_draft(text, text, jsonb, text, text) TO authenticated;

-- Publish all current drafts to live, snapshot the new state, and clear drafts.
CREATE OR REPLACE FUNCTION public.editor_publish(
  p_label text DEFAULT NULL,
  p_description text DEFAULT 'Published changes'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_version_id uuid;
  v_snapshot jsonb;
  v_css_draft text;
  v_js_draft text;
  v_head_draft text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  v_uid := auth.uid();
  SELECT email INTO v_email FROM public.admin_users WHERE user_id = v_uid;

  -- Promote drafts that differ from published.
  UPDATE public.site_edits
  SET published_value = draft_value,
      published_at = now(),
      published_by = v_uid;

  -- Promote ultra config drafts.
  SELECT custom_css_draft, custom_js_draft, head_html_draft
  INTO v_css_draft, v_js_draft, v_head_draft
  FROM public.site_ultra_config WHERE id = 1;

  UPDATE public.site_ultra_config SET
    custom_css_published = COALESCE(custom_css_draft, custom_css_published),
    custom_js_published = COALESCE(custom_js_draft, custom_js_published),
    head_html_published = COALESCE(head_html_draft, head_html_published),
    updated_at = now(),
    updated_by = v_uid
  WHERE id = 1;

  -- Build snapshot.
  SELECT jsonb_build_object(
    'edits', COALESCE(jsonb_agg(jsonb_build_object(
      'target_key', target_key,
      'prop', prop,
      'value', published_value
    )) FILTER (WHERE published_value IS NOT NULL), '[]'::jsonb)
  ) INTO v_snapshot
  FROM public.site_edits;

  INSERT INTO public.site_versions (
    label, description, change_type, snapshot,
    custom_css, custom_js, head_html, created_by
  ) VALUES (
    p_label, p_description, 'publish', v_snapshot,
    v_css_draft, v_js_draft, v_head_draft, v_uid
  ) RETURNING id INTO v_version_id;

  INSERT INTO public.site_action_log (
    action, change_type, description, version_id, performed_by, performed_by_email
  ) VALUES (
    'publish', 'mixed', p_description, v_version_id, v_uid, v_email
  );

  RETURN v_version_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_publish(text, text) TO authenticated;

-- Restore a previous version into the current draft state.
-- After restore, admin must Publish to make it live.
CREATE OR REPLACE FUNCTION public.editor_restore_version(p_version_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_snapshot jsonb;
  v_css text;
  v_js text;
  v_head text;
  v_edit jsonb;
  v_uid uuid;
  v_email text;
  v_label text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  v_uid := auth.uid();
  SELECT email INTO v_email FROM public.admin_users WHERE user_id = v_uid;

  SELECT snapshot, custom_css, custom_js, head_html, COALESCE(label, description)
  INTO v_snapshot, v_css, v_js, v_head, v_label
  FROM public.site_versions WHERE id = p_version_id;

  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'Version % not found', p_version_id;
  END IF;

  -- Reset existing drafts to NULL first so anything not in the snapshot is cleared.
  UPDATE public.site_edits SET
    draft_value = NULL,
    draft_updated_at = now(),
    draft_updated_by = v_uid;

  -- Apply each edit from the snapshot to drafts.
  FOR v_edit IN SELECT jsonb_array_elements(v_snapshot->'edits')
  LOOP
    INSERT INTO public.site_edits (target_key, prop, draft_value, draft_updated_at, draft_updated_by)
    VALUES (v_edit->>'target_key', v_edit->>'prop', v_edit->'value', now(), v_uid)
    ON CONFLICT (target_key, prop) DO UPDATE SET
      draft_value = EXCLUDED.draft_value,
      draft_updated_at = now(),
      draft_updated_by = v_uid;
  END LOOP;

  -- Restore ultra drafts.
  UPDATE public.site_ultra_config SET
    custom_css_draft = v_css,
    custom_js_draft = v_js,
    head_html_draft = v_head,
    updated_at = now(),
    updated_by = v_uid
  WHERE id = 1;

  INSERT INTO public.site_action_log (
    action, change_type, description, version_id, performed_by, performed_by_email
  ) VALUES (
    'restore', 'mixed',
    'Restored version: ' || COALESCE(v_label, p_version_id::text),
    p_version_id, v_uid, v_email
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_restore_version(uuid) TO authenticated;

-- Save Ultra config (CSS/JS/head) into draft.
CREATE OR REPLACE FUNCTION public.editor_save_ultra(
  p_field text,
  p_value text,
  p_description text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_email text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_field NOT IN ('css', 'js', 'head') THEN
    RAISE EXCEPTION 'Invalid field: %', p_field;
  END IF;
  v_uid := auth.uid();
  SELECT email INTO v_email FROM public.admin_users WHERE user_id = v_uid;

  IF p_field = 'css' THEN
    UPDATE public.site_ultra_config SET
      custom_css_draft = p_value, updated_at = now(), updated_by = v_uid
    WHERE id = 1;
  ELSIF p_field = 'js' THEN
    UPDATE public.site_ultra_config SET
      custom_js_draft = p_value, updated_at = now(), updated_by = v_uid
    WHERE id = 1;
  ELSE
    UPDATE public.site_ultra_config SET
      head_html_draft = p_value, updated_at = now(), updated_by = v_uid
    WHERE id = 1;
  END IF;

  INSERT INTO public.site_action_log (
    action, change_type, description, performed_by, performed_by_email
  ) VALUES (
    p_field, p_field, p_description, v_uid, v_email
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_save_ultra(text, text, text) TO authenticated;

-- Pin / unpin a version.
CREATE OR REPLACE FUNCTION public.editor_pin_version(p_version_id uuid, p_pinned boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.site_versions SET is_pinned = p_pinned WHERE id = p_version_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_pin_version(uuid, boolean) TO authenticated;

-- Add a note to a version.
CREATE OR REPLACE FUNCTION public.editor_set_version_note(p_version_id uuid, p_notes text, p_label text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.site_versions
  SET notes = p_notes, label = COALESCE(p_label, label)
  WHERE id = p_version_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_set_version_note(uuid, text, text) TO authenticated;

-- Reset all drafts back to published (discard unpublished changes).
CREATE OR REPLACE FUNCTION public.editor_discard_drafts()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_email text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  v_uid := auth.uid();
  SELECT email INTO v_email FROM public.admin_users WHERE user_id = v_uid;

  UPDATE public.site_edits SET
    draft_value = published_value,
    draft_updated_at = now(),
    draft_updated_by = v_uid;

  UPDATE public.site_ultra_config SET
    custom_css_draft = custom_css_published,
    custom_js_draft = custom_js_published,
    head_html_draft = head_html_published,
    updated_at = now(),
    updated_by = v_uid
  WHERE id = 1;

  INSERT INTO public.site_action_log (
    action, change_type, description, performed_by, performed_by_email
  ) VALUES (
    'discard', 'mixed', 'Discarded draft changes', v_uid, v_email
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.editor_discard_drafts() TO authenticated;
