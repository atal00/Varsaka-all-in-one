-- =========================================================================
-- Rollback Migration: Revert Services Schema Expansion
-- =========================================================================

ALTER TABLE public.services DROP COLUMN IF EXISTS slug;
ALTER TABLE public.services DROP COLUMN IF EXISTS icon;
ALTER TABLE public.services DROP COLUMN IF EXISTS image;
ALTER TABLE public.services DROP COLUMN IF EXISTS hero_title;
ALTER TABLE public.services DROP COLUMN IF EXISTS hero_subtitle;
ALTER TABLE public.services DROP COLUMN IF EXISTS hero_description;
ALTER TABLE public.services DROP COLUMN IF EXISTS hero_image;
ALTER TABLE public.services DROP COLUMN IF EXISTS tags;
ALTER TABLE public.services DROP COLUMN IF EXISTS overview;
ALTER TABLE public.services DROP COLUMN IF EXISTS capabilities;
ALTER TABLE public.services DROP COLUMN IF EXISTS process_steps;
ALTER TABLE public.services DROP COLUMN IF EXISTS metrics;
ALTER TABLE public.services DROP COLUMN IF EXISTS sections;
ALTER TABLE public.services DROP COLUMN IF EXISTS cta;
ALTER TABLE public.services DROP COLUMN IF EXISTS seo_title;
ALTER TABLE public.services DROP COLUMN IF EXISTS seo_description;
ALTER TABLE public.services DROP COLUMN IF EXISTS seo_keywords;
ALTER TABLE public.services DROP COLUMN IF EXISTS og_title;
ALTER TABLE public.services DROP COLUMN IF EXISTS og_description;
ALTER TABLE public.services DROP COLUMN IF EXISTS og_image;
ALTER TABLE public.services DROP COLUMN IF EXISTS canonical_url;
ALTER TABLE public.services DROP COLUMN IF EXISTS updated_at;
