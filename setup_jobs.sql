-- SQL Migration to create Jobs table, enable RLS, and seed default positions

-- 1. Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT DEFAULT '💼',
  title TEXT NOT NULL,
  location TEXT,
  type TEXT,
  exp TEXT,
  tags TEXT[], -- Array of strings for skills/tags
  description TEXT,
  posted TEXT,
  closes TEXT,
  apply_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Public can read jobs" ON jobs;
CREATE POLICY "Public can read jobs" ON jobs 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users all actions on jobs" ON jobs;
CREATE POLICY "Allow authenticated users all actions on jobs" ON jobs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Seed Default Job Openings safely
INSERT INTO jobs (icon, title, location, type, exp, tags, description, posted, closes, apply_link)
SELECT '🎓', '2026 Cohort Internship Program', 'Remote / Hybrid (SF / Bangalore)', 'Internship', 'Students / Grads', ARRAY['Tech', 'HR', 'Finance', 'Design', 'Management'], 'Join our intensive 12-week program. Open to all disciplines (Tech, HR, Finance, Design, Marketing, and Operations). Work on real projects, receive 1-on-1 mentorship, and accelerate your career.', '2 Jun 2026', '30 Jun 2026', '/apply?role=General+Application'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = '2026 Cohort Internship Program');

INSERT INTO jobs (icon, title, location, type, exp, tags, description, posted, closes, apply_link)
SELECT '🤖', 'Senior QA Automation Engineer', 'Hyderabad (Hybrid)', 'Full-Time', '3+ Years', ARRAY['Selenium', 'Playwright', 'Cypress', 'CI/CD'], 'Lead the design and implementation of end-to-end automation frameworks. You''ll own the test architecture, mentor junior engineers, and work closely with dev teams to shift quality left.', '1 May 2026', '31 May 2026', '/apply?role=Senior+QA+Automation+Engineer'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Senior QA Automation Engineer');

INSERT INTO jobs (icon, title, location, type, exp, tags, description, posted, closes, apply_link)
SELECT '⚡', 'Performance Test Engineer', 'Remote', 'Full-Time', '2+ Years', ARRAY['JMeter', 'k6', 'Gatling', 'Cloud'], 'Design and execute load, stress, and soak tests for high-traffic applications. You''ll identify bottlenecks, build perf dashboards, and work with DevOps to integrate tests into pipelines.', '1 May 2026', '31 May 2026', '/apply?role=Performance+Test+Engineer'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Performance Test Engineer');

INSERT INTO jobs (icon, title, location, type, exp, tags, description, posted, closes, apply_link)
SELECT '👥', 'HR Generalist / Talent Acquisition', 'Hyderabad', 'Full-Time', '2+ Years', ARRAY['Recruitment', 'Onboarding', 'HR Operations', 'Culture'], 'Lead our recruitment efforts and help build a world-class team culture. You''ll manage the end-to-end hiring process, from sourcing candidates to onboarding new team members.', '10 May 2026', '10 Jun 2026', '/apply?role=HR+Generalist'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'HR Generalist / Talent Acquisition');

INSERT INTO jobs (icon, title, location, type, exp, tags, description, posted, closes, apply_link)
SELECT '🧪', 'QA Engineer - Manual & Exploratory', 'Hyderabad', 'Full-Time / Intern', '0-2 Years', ARRAY['Test Cases', 'Bug Reporting', 'Jira', 'Agile'], 'Join our QA team to write detailed test cases, perform exploratory testing, and help maintain quality across multiple client projects. Great entry point for freshers who are passionate about quality.', '8 May 2026', '8 Jun 2026', '/apply?role=QA+Engineer+Manual'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'QA Engineer - Manual & Exploratory');
