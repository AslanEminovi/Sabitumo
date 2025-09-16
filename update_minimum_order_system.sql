-- Update minimum order system for Sabitumo
-- 1. Make min_order_quantity optional in products table
-- 2. Add global minimum order configuration

-- First, check if min_order_quantity column exists and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'min_order_quantity') THEN
        ALTER TABLE products ADD COLUMN min_order_quantity INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Remove NOT NULL constraint if it exists
ALTER TABLE products ALTER COLUMN min_order_quantity DROP NOT NULL;

-- Create site_settings table for global configuration
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert global minimum order amount setting
INSERT INTO site_settings (key, value, description) 
VALUES ('minimum_order_amount', '200', 'Global minimum order amount in GEL')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- Create trigger for site_settings updated_at
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for site_settings
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Update existing products to have NULL min_order_quantity (optional)
-- You can manually set specific products to have minimum quantities later
UPDATE products SET min_order_quantity = NULL WHERE min_order_quantity = 1;

-- Example: Set minimum order quantity for specific products (optional)
-- UPDATE products SET min_order_quantity = 2 WHERE name_en ILIKE '%bulk%';
-- UPDATE products SET min_order_quantity = 5 WHERE category_id IN (SELECT id FROM categories WHERE name_en = 'Ammunition');

COMMIT;
