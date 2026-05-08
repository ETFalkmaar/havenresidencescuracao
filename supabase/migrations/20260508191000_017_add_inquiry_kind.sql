-- Distinguish rental enquiries from property-management enquiries.
-- Rentals continue to flow through the existing residence pages;
-- "management" comes from the new /beheer page.
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'rental';

-- Constrain to known kinds (use DO block to avoid duplicate-add errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_kind_check'
  ) THEN
    ALTER TABLE public.inquiries
      ADD CONSTRAINT inquiries_kind_check
      CHECK (kind IN ('rental', 'management'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_inquiries_kind ON public.inquiries (kind);
