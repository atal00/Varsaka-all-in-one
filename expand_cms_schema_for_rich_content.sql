-- Migration: Expand CMS Schema for Rich Content & Long-Form Publications

-- 1. Blogs Table Expansion
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Software Testing';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Varsaka QA Engineering Team';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'Quality Engineering Architects';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '8 min read';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Case Studies Table Expansion
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS business_context TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS challenge TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS objectives TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS strategy TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS technologies TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS implementation TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS results TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS metrics_verified TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS lessons_learned TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Slugs Generation for Existing Blogs
UPDATE blogs SET slug = 'top-10-security-mistakes-startups-make' WHERE title ILIKE '%top 10 security%';
UPDATE blogs SET slug = 'manual-vs-automated-testing' WHERE title ILIKE '%manual vs automated%';
UPDATE blogs SET slug = 'practical-ai-in-software-testing' WHERE title ILIKE '%why ai is%';
UPDATE blogs SET slug = 'choosing-the-right-automation-framework' WHERE title ILIKE '%choosing the right automation%';
UPDATE blogs SET slug = 'future-of-qa-automation' WHERE title ILIKE '%future of qa%';

-- 4. Slugs Generation for Existing Case Studies
UPDATE case_studies SET slug = 'ourfab-technologies-fintech-security' WHERE client ILIKE '%ourfab%';
UPDATE case_studies SET slug = 'retailedge-india-performance-scale' WHERE client ILIKE '%retailedge%';
UPDATE case_studies SET slug = 'techtd-platform-regression-automation' WHERE client ILIKE '%techtd%';
UPDATE case_studies SET slug = 'takecare360-ai-powered-healthcare-qa' WHERE client ILIKE '%takecare360%';
