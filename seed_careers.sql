-- =========================================================================
-- Idempotent Production Seed: Careers / Jobs
-- Varsaka Labs Enterprise Database Seed
-- =========================================================================

-- 1. Ensure table structure is present with proper schema
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT DEFAULT '💼',
  location TEXT,
  type TEXT DEFAULT 'Full-Time',
  exp TEXT,
  tags TEXT[],
  description TEXT,
  posted TEXT,
  closes TEXT,
  apply_link TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure RLS is active
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 2. Idempotently insert the 5 existing website Career records
-- Uses deterministic UUIDs so running multiple times safely updates without creating duplicates.
INSERT INTO public.jobs (
  id,
  title,
  icon,
  location,
  type,
  exp,
  tags,
  description,
  posted,
  closes,
  apply_link,
  status
)
VALUES
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    '2026 Cohort Internship Program',
    '🎓',
    'Remote / Hybrid (SF / Bangalore)',
    'Internship',
    'Students / Grads',
    ARRAY['Tech', 'HR', 'Finance', 'Design', 'Management']::text[],
    'Join our intensive 12-week program. Open to all disciplines (Tech, HR, Finance, Design, Marketing, and Operations). Work on real projects, receive 1-on-1 mentorship, and accelerate your career.',
    '2 Jun 2026',
    '30 Jun 2026',
    '/apply?role=General+Application',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000002'::uuid,
    'Senior QA Automation Engineer',
    '🤖',
    'Hyderabad (Hybrid)',
    'Full-Time',
    '3+ Years',
    ARRAY['Selenium', 'Playwright', 'Cypress', 'CI/CD']::text[],
    'Lead the design and implementation of end-to-end automation frameworks. You''ll own the test architecture, mentor junior engineers, and work closely with dev teams to shift quality left.',
    '1 May 2026',
    '31 May 2026',
    '/apply?role=Senior+QA+Automation+Engineer',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000003'::uuid,
    'Performance Test Engineer',
    '⚡',
    'Remote',
    'Full-Time',
    '2+ Years',
    ARRAY['JMeter', 'k6', 'Gatling', 'Cloud']::text[],
    'Design and execute load, stress, and soak tests for high-traffic applications. You''ll identify bottlenecks, build perf dashboards, and work with DevOps to integrate tests into pipelines.',
    '1 May 2026',
    '31 May 2026',
    '/apply?role=Performance+Test+Engineer',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000004'::uuid,
    'HR Generalist / Talent Acquisition',
    '👥',
    'Hyderabad',
    'Full-Time',
    '2+ Years',
    ARRAY['Recruitment', 'Onboarding', 'HR Operations', 'Culture']::text[],
    'Lead our recruitment efforts and help build a world-class team culture. You''ll manage the end-to-end hiring process, from sourcing candidates to onboarding new team members.',
    '10 May 2026',
    '10 Jun 2026',
    '/apply?role=HR+Generalist',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000005'::uuid,
    'QA Engineer - Manual & Exploratory',
    '🧪',
    'Hyderabad',
    'Full-Time / Intern',
    '0-2 Years',
    ARRAY['Test Cases', 'Bug Reporting', 'Jira', 'Agile']::text[],
    'Join our QA team to write detailed test cases, perform exploratory testing, and help maintain quality across multiple client projects. Great entry point for freshers who are passionate about quality.',
    '8 May 2026',
    '8 Jun 2026',
    '/apply?role=QA+Engineer+Manual',
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  icon = EXCLUDED.icon,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  exp = EXCLUDED.exp,
  tags = EXCLUDED.tags,
  description = EXCLUDED.description,
  posted = EXCLUDED.posted,
  closes = EXCLUDED.closes,
  apply_link = EXCLUDED.apply_link,
  status = EXCLUDED.status;
