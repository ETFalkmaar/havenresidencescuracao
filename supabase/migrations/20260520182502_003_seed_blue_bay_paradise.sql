do $$
declare
  v_property_id uuid;
  v_woonkamer_id uuid;
  v_keuken_id uuid;
  v_slk1_id uuid;
  v_slk2_id uuid;
  v_bad_id uuid;
  v_zwem_id uuid;
  v_overig_id uuid;
begin
  insert into public.properties (
    slug, name, location,
    short_description, description,
    hero_photo_src, hero_photo_alt,
    max_guests, max_guests_note,
    bedrooms, beds, bathrooms,
    check_in, check_out,
    base_price_per_night_usd, cleaning_fee_usd, deposit_usd,
    long_term_nights, long_term_discount_percent, min_nights,
    high_season_note, cancellation_policy,
    display_order, is_published
  ) values (
    'blue-bay-paradise',
    'Blue Bay Paradise',
    'Blue Bay Resort, Willemstad, Curaçao',
    'Stijlvol appartement op het exclusieve Blue Bay Resort met privézwembad en op 100 meter van het strand.',
    'Ervaar luxe en comfort in ons stijlvolle appartement op het exclusieve Blue Bay Resort op Curaçao. Het appartement beschikt over twee ruime slaapkamers en biedt plaats aan maximaal 5 gasten. Geniet van je privézwembad en loop in slechts 100 meter naar het prachtige strand. Als gast heb je toegang tot alle resortfaciliteiten zoals restaurants, beachclubs, golfbaan en 24/7 beveiliging. Centraal gelegen nabij Willemstad en ideaal om zowel Westpunt als de oostkant van het eiland te ontdekken.',
    '/properties/blue-bay-paradise/zwembad/07.jpeg',
    'Blue Bay Paradise — zwembad met uitzicht op zee',
    5, 'maximaal 5 personen waarvan 1 kind',
    2, 2, 1,
    '15:00', '11:00',
    350, 100, 300,
    28, 10, 1,
    'Op Curaçao valt het hoogseizoen in december (kerst en oud-en-nieuw) en februari (carnaval) — onze prijs blijft het hele jaar gelijk.',
    'Gratis annuleren tot één maand voor aankomst. Bij annulering binnen één maand vóór aankomst is restitutie niet meer mogelijk.',
    0, true
  ) returning id into v_property_id;

  insert into public.property_highlights (property_id, title, description, display_order) values
    (v_property_id, 'Privézwembad', 'Eigen zwembad direct bij de woning — duik er meteen in.', 0),
    (v_property_id, '100 m van het strand', 'Wandel binnen enkele minuten naar het prachtige Blue Bay strand.', 1),
    (v_property_id, 'Resort-faciliteiten', 'Restaurants, beachclubs, golfbaan en 24/7 beveiliging binnen het resort.', 2),
    (v_property_id, 'Centrale locatie', 'Nabij Willemstad — ontdek zowel Westpunt als de oostkant van het eiland.', 3);

  insert into public.property_house_rules (property_id, rule, display_order) values
    (v_property_id, 'Roken alleen buiten toegestaan, niet binnen.', 0),
    (v_property_id, 'Feesten zijn niet toegestaan.', 1),
    (v_property_id, 'Extra gasten dienen altijd vooraf gemeld te worden.', 2);

  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'woonkamer', 'Woonkamer', 0) returning id into v_woonkamer_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'keuken', 'Keuken', 1) returning id into v_keuken_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'slaapkamer-1', 'Slaapkamer 1', 2) returning id into v_slk1_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'slaapkamer-2', 'Slaapkamer 2', 3) returning id into v_slk2_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'badkamer', 'Badkamer', 4) returning id into v_bad_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'zwembad', 'Zwembad', 5) returning id into v_zwem_id;
  insert into public.property_rooms (property_id, slug, label, display_order)
    values (v_property_id, 'overig', 'Overig', 6) returning id into v_overig_id;

  insert into public.room_amenities (room_id, label, display_order) values
    (v_woonkamer_id, 'Airconditioning', 0),
    (v_woonkamer_id, 'Boeken en leesmateriaal', 1),
    (v_woonkamer_id, 'TV', 2);

  insert into public.room_amenities (room_id, label, display_order) values
    (v_keuken_id, 'Barbecuespullen', 0),
    (v_keuken_id, 'Blender', 1),
    (v_keuken_id, 'Borden en bestek', 2),
    (v_keuken_id, 'Broodrooster', 3),
    (v_keuken_id, 'Fornuis', 4),
    (v_keuken_id, 'Koelkast', 5),
    (v_keuken_id, 'Koffiezetapparaat', 6),
    (v_keuken_id, 'Kookbenodigdheden', 7),
    (v_keuken_id, 'Magnetron', 8),
    (v_keuken_id, 'Oven', 9),
    (v_keuken_id, 'Vaatwasser', 10),
    (v_keuken_id, 'Vriezer', 11),
    (v_keuken_id, 'Waterkoker', 12),
    (v_keuken_id, 'Wijnglazen', 13);

  insert into public.room_amenities (room_id, label, display_order) values
    (v_slk1_id, 'Tweepersoonsbed', 0),
    (v_slk1_id, 'Airconditioning', 1),
    (v_slk1_id, 'Beddengoed', 2),
    (v_slk1_id, 'Extra kussens en dekens', 3),
    (v_slk1_id, 'Kledinghangers', 4),
    (v_slk1_id, 'Opbergruimte voor kleding', 5),
    (v_slk1_id, 'Verduisterende gordijnen', 6),
    (v_slk1_id, 'Strijkijzer', 7);

  insert into public.room_amenities (room_id, label, display_order) values
    (v_slk2_id, 'Tweepersoonsbed', 0),
    (v_slk2_id, 'Airconditioning', 1);

  insert into public.room_amenities (room_id, label, display_order) values
    (v_zwem_id, 'Ligstoelen', 0);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_woonkamer_id, '/properties/blue-bay-paradise/woonkamer/01.jpeg', 'Blue Bay Paradise — woonkamer', 0),
    (v_woonkamer_id, '/properties/blue-bay-paradise/woonkamer/02.jpeg', 'Blue Bay Paradise — woonkamer', 1),
    (v_woonkamer_id, '/properties/blue-bay-paradise/woonkamer/03.jpeg', 'Blue Bay Paradise — woonkamer', 2),
    (v_woonkamer_id, '/properties/blue-bay-paradise/woonkamer/04.jpeg', 'Blue Bay Paradise — woonkamer', 3);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_keuken_id, '/properties/blue-bay-paradise/keuken/01.jpeg', 'Blue Bay Paradise — keuken', 0),
    (v_keuken_id, '/properties/blue-bay-paradise/keuken/02.jpeg', 'Blue Bay Paradise — keuken', 1);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_slk1_id, '/properties/blue-bay-paradise/slaapkamer-1/01.jpeg', 'Blue Bay Paradise — slaapkamer 1', 0),
    (v_slk1_id, '/properties/blue-bay-paradise/slaapkamer-1/02.jpeg', 'Blue Bay Paradise — slaapkamer 1', 1),
    (v_slk1_id, '/properties/blue-bay-paradise/slaapkamer-1/03.jpeg', 'Blue Bay Paradise — slaapkamer 1', 2);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_slk2_id, '/properties/blue-bay-paradise/slaapkamer-2/01.jpeg', 'Blue Bay Paradise — slaapkamer 2', 0);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_bad_id, '/properties/blue-bay-paradise/badkamer/01.jpeg', 'Blue Bay Paradise — badkamer', 0);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/01.jpeg', 'Blue Bay Paradise — zwembad', 0),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/02.jpeg', 'Blue Bay Paradise — zwembad', 1),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/03.jpeg', 'Blue Bay Paradise — zwembad', 2),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/04.jpeg', 'Blue Bay Paradise — zwembad', 3),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/05.jpeg', 'Blue Bay Paradise — zwembad', 4),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/06.jpeg', 'Blue Bay Paradise — zwembad', 5),
    (v_zwem_id, '/properties/blue-bay-paradise/zwembad/07.jpeg', 'Blue Bay Paradise — zwembad', 6);

  insert into public.property_photos (room_id, src, alt, display_order) values
    (v_overig_id, '/properties/blue-bay-paradise/overig/01.jpeg', 'Blue Bay Paradise — extra foto', 0),
    (v_overig_id, '/properties/blue-bay-paradise/overig/02.jpeg', 'Blue Bay Paradise — extra foto', 1),
    (v_overig_id, '/properties/blue-bay-paradise/overig/03.jpeg', 'Blue Bay Paradise — extra foto', 2),
    (v_overig_id, '/properties/blue-bay-paradise/overig/04.jpeg', 'Blue Bay Paradise — extra foto', 3),
    (v_overig_id, '/properties/blue-bay-paradise/overig/05.jpeg', 'Blue Bay Paradise — extra foto', 4);
end $$;
