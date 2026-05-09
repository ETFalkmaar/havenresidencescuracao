-- Fix: editor_publish, editor_restore_version, editor_discard_drafts
-- All three did `UPDATE site_edits SET ...` with no WHERE clause; Postgres
-- on Supabase rejects that with `UPDATE requires a WHERE clause`. Add explicit
-- WHERE conditions so the bulk updates run.

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

  UPDATE public.site_edits
  SET published_value = draft_value,
      published_at = now(),
      published_by = v_uid
  WHERE published_value IS DISTINCT FROM draft_value;

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

  UPDATE public.site_edits SET
    draft_value = NULL,
    draft_updated_at = now(),
    draft_updated_by = v_uid
  WHERE id IS NOT NULL;

  FOR v_edit IN SELECT jsonb_array_elements(v_snapshot->'edits')
  LOOP
    INSERT INTO public.site_edits (target_key, prop, draft_value, draft_updated_at, draft_updated_by)
    VALUES (v_edit->>'target_key', v_edit->>'prop', v_edit->'value', now(), v_uid)
    ON CONFLICT (target_key, prop) DO UPDATE SET
      draft_value = EXCLUDED.draft_value,
      draft_updated_at = now(),
      draft_updated_by = v_uid;
  END LOOP;

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
    draft_updated_by = v_uid
  WHERE draft_value IS DISTINCT FROM published_value;

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
