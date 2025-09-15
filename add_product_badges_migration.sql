-- Add product badge fields
-- Add is_new_arrival and is_bestseller columns to products table

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;

-- Update existing products to set some as new arrivals (most recent 10)
UPDATE products 
SET is_new_arrival = true 
WHERE id IN (
  SELECT id 
  FROM products 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 10
);

-- Update some products as bestsellers (you can manually set these later)
-- For now, we'll mark some featured products as bestsellers
UPDATE products 
SET is_bestseller = true 
WHERE is_featured = true 
AND id IN (
  SELECT id 
  FROM products 
  WHERE is_featured = true 
  ORDER BY created_at ASC 
  LIMIT 5
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller);

-- Add comment for documentation
COMMENT ON COLUMN products.is_new_arrival IS 'Indicates if the product is a new arrival';
COMMENT ON COLUMN products.is_bestseller IS 'Indicates if the product is a bestseller';

