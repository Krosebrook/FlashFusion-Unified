-- =============================================================================
-- Supabase OTP Expiry Fix - SQL Script
-- =============================================================================
-- Run this in Supabase SQL Editor to fix long OTP expiry times

-- 1. Update existing auth configuration
UPDATE auth.config 
SET 
  -- Set OTP expiry to 5 minutes (300 seconds)
  otp_expiry = 300,
  email_otp_expiry = 300,
  sms_otp_expiry = 300
WHERE id = 1;

-- 2. Create config if it doesn't exist
INSERT INTO auth.config (
  id, 
  otp_expiry, 
  email_otp_expiry, 
  sms_otp_expiry,
  password_min_length,
  jwt_exp
)
SELECT 
  1,           -- config id
  300,         -- 5 minutes for OTP
  300,         -- 5 minutes for email OTP  
  300,         -- 5 minutes for SMS OTP
  8,           -- 8 character minimum password
  3600         -- 1 hour JWT expiry
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config WHERE id = 1
);

-- 3. Verify the changes
SELECT 
  id,
  otp_expiry,
  email_otp_expiry,
  sms_otp_expiry,
  password_min_length,
  jwt_exp,
  created_at,
  updated_at
FROM auth.config 
WHERE id = 1;

-- 4. Optional: Clean up old expired OTP codes
DELETE FROM auth.otp 
WHERE expires_at < NOW();

-- 5. Optional: Update session settings
-- UPDATE auth.config 
-- SET jwt_exp = 3600  -- 1 hour session expiry
-- WHERE id = 1;