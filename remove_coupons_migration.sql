-- Remove Coupon and Discount Functionality
-- This migration removes all coupon-related tables and columns

-- Remove coupon-related columns from orders table
ALTER TABLE orders 
DROP COLUMN IF EXISTS coupon_code,
DROP COLUMN IF EXISTS discount_amount;

-- Drop coupons table if it exists
DROP TABLE IF EXISTS coupons;

-- Drop abandoned_carts table (we don't need it without coupons)
DROP TABLE IF EXISTS abandoned_carts;

-- Remove any indexes related to coupons
DROP INDEX IF EXISTS idx_orders_coupon_code;
DROP INDEX IF EXISTS idx_coupons_code;
DROP INDEX IF EXISTS idx_abandoned_carts_user;

COMMIT;
