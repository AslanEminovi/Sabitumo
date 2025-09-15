-- Create brands table if it doesn't exist
CREATE TABLE
IF NOT EXISTS brands
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    name VARCHAR
(100) NOT NULL UNIQUE,
    slug VARCHAR
(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_ka TEXT,
    logo VARCHAR
(255),
    website VARCHAR
(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Add brand_id column to products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'products' AND column_name = 'brand_id') THEN
  ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands
  (id);
END
IF;
END $$;

-- Insert existing brands if they don't exist
INSERT INTO brands
  (name, slug, description_en, description_ka, logo, website, is_active, created_at, updated_at)
VALUES
  -- LOWA
  ('LOWA', 'lowa',
    'LOWA is a German company that has been manufacturing premium outdoor and military boots since 1923.',
    'LOWA არის გერმანული კომპანია, რომელიც 1923 წლიდან აწარმოებს პრემიუმ გარე და სამხედრო ჩექმებს.',
    '/lowa-boots-logo.png', 'https://www.lowa.com', true, now(), now()),

  -- Spyderco
  ('Spyderco', 'spyderco',
    'Spyderco is an American knife manufacturer known for innovative folding knives and cutting tools.',
    'Spyderco არის ამერიკული დანების მწარმოებელი, რომელიც ცნობილია ინოვაციური დასაკეცი დანებით და საჭრელი ხელსაწყოებით.',
    '/Spyderco-Logo.png', 'https://www.spyderco.com', true, now(), now()),

  -- 5.11 Tactical
  ('5.11 Tactical', '511-tactical',
    '5.11 Tactical designs and manufactures tactical gear and apparel for law enforcement, military, and outdoor enthusiasts.',
    '5.11 Tactical ასრულებს და აწარმოებს ტაქტიკურ აღჭურვილობას და ტანსაცმელს სამართალდამცავი ორგანოებისთვის, სამხედროებისთვის და გარე აქტივობების მოყვარულებისთვის.',
    '/511_tactical_logo.jpg-removebg-preview-2.png', 'https://www.511tactical.com', true, now(), now()),

  -- Haix
  ('Haix', 'haix',
    'Haix is a German manufacturer of high-quality boots for professionals, firefighters, police, and outdoor enthusiasts.',
    'Haix არის გერმანული მწარმოებელი მაღალი ხარისხის ჩექმებისა პროფესიონალებისთვის, მეხანძრეებისთვის, პოლიციისთვის და გარე აქტივობების მოყვარულებისთვის.',
    '/haix-logo.png', 'https://www.haix.com', true, now(), now()),

  -- Maxpedition
  ('Maxpedition', 'maxpedition',
    'Maxpedition produces tactical bags, backpacks, and gear for military, law enforcement, and outdoor use.',
    'Maxpedition აწარმოებს ტაქტიკურ ჩანთებს, ზურგჩანთებს და აღჭურვილობას სამხედრო, სამართალდამცავი და გარე გამოყენებისთვის.',
    '/maxpedition.png', 'https://www.maxpedition.com', true, now(), now()),

  -- Cold Steel
  ('Cold Steel', 'cold-steel',
    'Cold Steel manufactures knives, swords, and tools known for their strength and cutting performance.',
    'Cold Steel აწარმოებს დანებს, მახვილებს და ხელსაწყოებს, რომლებიც ცნობილია თავიანთი სიძლიერითა და საჭრელი შესაძლებლობებით.',
    '/cold-steel-logo-01_1607027612__33201.original.png', 'https://www.coldsteel.com', true, now(), now()),

  -- Browning (New)
  ('Browning', 'browning',
    'Browning is a leading manufacturer of hunting and outdoor equipment, including firearms, knives, and outdoor gear.',
    'ბრაუნინგი არის ნადირობისა და გარე აღჭურვილობის წამყვანი მწარმოებელი, მათ შორის ცეცხლსასროლი იარაღის, დანების და გარე აღჭურვილობის.',
    '/browning-logo-logo-png-transparent.png', 'https://www.browning.com', true, now(), now())

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
