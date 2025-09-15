-- Add Microtech brand to the brands table
INSERT INTO brands
    (name, slug, description_en, description_ka, logo, website, is_active, created_at, updated_at)
VALUES
    (
        'Microtech',
        'microtech',
        'Microtech is an American manufacturer of premium automatic knives and tactical cutting tools, known for their innovative designs and superior quality.',
        'მაიკროტექი არის ამერიკული პრემიუმ ავტომატური დანების და ტაქტიკური საჭრელი ხელსაწყოების მწარმოებელი, რომელიც ცნობილია ინოვაციური დიზაინით და უმაღლესი ხარისხით.',
        '/MT-Logo-Simple-Red-1200x628.png.webp',
        'https://www.microtechknives.com',
        true,
        now(),
        now()
)
ON CONFLICT
(slug) DO
UPDATE SET
  name = EXCLUDED.name,
  description_en = EXCLUDED.description_en,
  description_ka = EXCLUDED.description_ka,
  logo = EXCLUDED.logo,
  website = EXCLUDED.website,
  is_active = EXCLUDED.is_active,
  updated_at = now();


