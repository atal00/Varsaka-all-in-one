-- =========================================================================
-- Migration: Expand Services Schema for Full CMS Service Builder
-- Safe, idempotent, non-destructive migration
-- =========================================================================

-- 1. URL Slug and Media
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🧪';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Hero & Intro Fields
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hero_description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- 3. Structured Content & Repeatable Section Containers (JSONB)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS overview JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cta JSONB DEFAULT '{}'::jsonb;

-- 4. SEO & Metadata
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 5. Populate Default Slugs & Icons for Existing Core Services
UPDATE public.services SET slug = 'functional-testing', icon = '🧪' WHERE name ILIKE '%functional%' AND (slug IS NULL OR slug = '');
UPDATE public.services SET slug = 'security-testing', icon = '🔐' WHERE name ILIKE '%security%' AND (slug IS NULL OR slug = '');
UPDATE public.services SET slug = 'ai-powered-testing', icon = '🤖' WHERE name ILIKE '%ai%' AND (slug IS NULL OR slug = '');

-- Fallback for any remaining services without slug
UPDATE public.services SET slug = lower(trim(both '-' from regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) WHERE slug IS NULL OR slug = '';
