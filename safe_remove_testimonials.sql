-- ====================================================================
-- SAFE MIGRATION: REMOVE TESTIMONIALS TABLE
-- ====================================================================
-- Audit Summary:
-- Total Records in 'testimonials': 2 (Demo records created during initial setup:
--   1. John Doe - TechCorp - "Varsaka delivered outstanding testing services."
--   2. Jane Smith - StartupInc - "Incredible attention to detail."
-- Foreign Key Dependencies: NONE (No other table references 'testimonials').
-- Application Status: All UI tabs, forms, modals, queries, and permissions 
-- have been completely removed from the Varsaka frontend & admin applications.
--
-- Instructions:
-- Run this script in the Supabase SQL Editor if you wish to permanently
-- drop the unused 'testimonials' table and its RLS policies.
-- ====================================================================

-- 1. Drop existing RLS policies on testimonials if any
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow authenticated users all actions on testimonials" ON testimonials;

-- 2. Drop testimonials table safely
DROP TABLE IF EXISTS testimonials CASCADE;
