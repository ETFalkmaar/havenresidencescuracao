-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_review_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- admin_users: self read + admin all
CREATE POLICY "admin_users self read" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "admin_users admin write" ON public.admin_users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- properties: public can read non-draft
CREATE POLICY "properties public read" ON public.properties
  FOR SELECT USING (status IN ('active', 'coming_soon') OR public.is_admin());
CREATE POLICY "properties admin write" ON public.properties
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- units: public read active
CREATE POLICY "units public read" ON public.units
  FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "units admin write" ON public.units
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- photos: public read all
CREATE POLICY "photos public read" ON public.photos
  FOR SELECT USING (true);
CREATE POLICY "photos admin write" ON public.photos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- amenities: public read
CREATE POLICY "amenities public read" ON public.amenities
  FOR SELECT USING (true);
CREATE POLICY "amenities admin write" ON public.amenities
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- unit_amenities: public read
CREATE POLICY "unit_amenities public read" ON public.unit_amenities
  FOR SELECT USING (true);
CREATE POLICY "unit_amenities admin write" ON public.unit_amenities
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- pricing_seasons: public read
CREATE POLICY "pricing public read" ON public.pricing_seasons
  FOR SELECT USING (true);
CREATE POLICY "pricing admin write" ON public.pricing_seasons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- bookings: admin only (public bookings via service role + RPC later)
CREATE POLICY "bookings admin all" ON public.bookings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- inquiries: anyone can submit, admin can read/manage
CREATE POLICY "inquiries public insert" ON public.inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries admin read" ON public.inquiries
  FOR SELECT USING (public.is_admin());
CREATE POLICY "inquiries admin update" ON public.inquiries
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- reviews: public read published
CREATE POLICY "reviews public read" ON public.reviews
  FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "reviews admin write" ON public.reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- external_review_aggregates: public read
CREATE POLICY "external_reviews public read" ON public.external_review_aggregates
  FOR SELECT USING (true);
CREATE POLICY "external_reviews admin write" ON public.external_review_aggregates
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- site_settings: public read
CREATE POLICY "site_settings public read" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "site_settings admin write" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
