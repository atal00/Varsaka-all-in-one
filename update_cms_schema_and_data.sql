-- =========================================================================
-- Varsaka Labs CMS Schema & Data Hardening Migration
-- =========================================================================

-- 1. Hardening case_studies Schema
ALTER TABLE public.case_studies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.case_studies ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'fa-chart-line';
ALTER TABLE public.case_studies ADD COLUMN IF NOT EXISTS content TEXT;

UPDATE public.case_studies SET status = 'published' WHERE status IS NULL;

-- Assign tailored FontAwesome icons to existing case studies
UPDATE public.case_studies SET icon = 'fa-shield-halved' WHERE client ILIKE '%Ourfab%';
UPDATE public.case_studies SET icon = 'fa-gauge-high' WHERE client ILIKE '%RetailEdge%';
UPDATE public.case_studies SET icon = 'fa-bolt-lightning' WHERE client ILIKE '%Techtd%';
UPDATE public.case_studies SET icon = 'fa-robot' WHERE client ILIKE '%TakeCare360%';

-- Ensure public can read published case studies
DROP POLICY IF EXISTS "Authorized users can view case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Public can view published case studies" ON public.case_studies;
CREATE POLICY "Public can view published case studies" ON public.case_studies
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published' OR 
    (auth.role() = 'authenticated' AND (public.is_admin() OR public.has_module_permission('case_studies', 'view')))
  );

-- 2. Hardening blogs Schema
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'Technology';

-- Insert the 4 published rich blogs if not already present
INSERT INTO public.blogs (id, title, summary, content, date, status, views, tag)
SELECT 
  gen_random_uuid(), 
  'Choosing the Right Automation Framework', 
  'Cypress, Playwright, or Selenium? Let''s break down which test framework fits your architecture.', 
  '<p style="font-size: 1.25rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 2rem;">Automation is no longer just a buzzword; it''s the backbone of modern software delivery. As teams push for faster release cycles, manual testing simply can''t keep up.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">The Shift in Mindset</h2><p>We often talk to engineering teams who treat QA as an afterthought—a bottleneck right before release. But the most successful teams we work with at Varsaka have shifted left. They treat test code with the same respect as production code.</p><p>When you automate the right way, you''re not just saving time; you''re building a safety net that empowers developers to move fast without breaking things.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">What Should You Actually Automate?</h2><p>A common mistake is trying to automate 100% of your test cases. That''s a recipe for fragile, high-maintenance test suites. Instead, focus on Core Business Flows, Regression Tests, and Data-Heavy Scenarios.</p>',
  '2023-11-01', 
  'published', 
  1420,
  'Automation'
WHERE NOT EXISTS (SELECT 1 FROM public.blogs WHERE title = 'Choosing the Right Automation Framework');

INSERT INTO public.blogs (id, title, summary, content, date, status, views, tag)
SELECT 
  gen_random_uuid(), 
  'Why AI is the Best Thing to Happen to Software Testing', 
  'AI won''t replace testers, but testers using AI will replace those who don''t.', 
  '<p style="font-size: 1.25rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 2rem;">Let''s address the elephant in the room: AI is not here to steal your QA job. But a QA engineer who uses AI might.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">Beyond the Hype</h2><p>At Varsaka, we''ve been experimenting heavily with AI-assisted testing. What we''ve found is that generative AI is incredible at boilerplate generation. It can write your basic Cypress or Playwright skeletons in seconds.</p><p>The future of QA isn''t fully autonomous; it''s heavily augmented. The engineers who embrace these tools now will be the ones leading the industry in the next five years.</p>',
  '2023-11-15', 
  'published', 
  1980,
  'AI & Future'
WHERE NOT EXISTS (SELECT 1 FROM public.blogs WHERE title = 'Why AI is the Best Thing to Happen to Software Testing');

INSERT INTO public.blogs (id, title, summary, content, date, status, views, tag)
SELECT 
  gen_random_uuid(), 
  'Manual vs Automated Testing', 
  'Why a hybrid approach is the only sustainable way to scale software quality assurance.', 
  '<p style="font-size: 1.25rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 2rem;">The tech industry loves extremes. We are constantly told that "manual testing is dead" and everything must be automated. But the reality is far more nuanced.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">The Case for Automation</h2><p>Automation is non-negotiable for modern software development. It provides speed, consistency, and a massive safety net for regression testing.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">The Irreplaceable Human Element</h2><p>This is where exploratory testing shines. Humans are curious, adaptable, and empathetic to user experience.</p>',
  '2023-12-05', 
  'published', 
  1650,
  'Best Practices'
WHERE NOT EXISTS (SELECT 1 FROM public.blogs WHERE title = 'Manual vs Automated Testing');

INSERT INTO public.blogs (id, title, summary, content, date, status, views, tag)
SELECT 
  gen_random_uuid(), 
  'The Top 10 Security Mistakes Startups Make', 
  'How to avoid the most common security vulnerabilities when shipping fast in early-stage products.', 
  '<p style="font-size: 1.25rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 2rem;">When you''re racing to market, security is often the first thing pushed to "Phase 2". But in today''s digital landscape, a single vulnerability can cost you your entire reputation.</p><h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">The Silent Killers</h2><p>Most breaches don''t happen because of sophisticated zero-day exploits. They happen because of simple oversights: exposed API keys in public repositories, missing rate limiters, or broken authentication logic.</p>',
  '2023-12-20', 
  'published', 
  2310,
  'Security'
WHERE NOT EXISTS (SELECT 1 FROM public.blogs WHERE title = 'The Top 10 Security Mistakes Startups Make');

-- 3. Insert the 6 missing default FAQs
INSERT INTO public.faqs (question, answer, category)
SELECT 'How quickly can you start testing our app?', 'We can usually jump in and start testing within 3 to 5 business days after our initial discovery call and requirements alignment.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'How quickly can you start testing our app?');

INSERT INTO public.faqs (question, answer, category)
SELECT 'Do we get our own dedicated testers?', 'Absolutely! You get a dedicated crew of senior QA engineers who embed directly into your sprint cycles, Slack, and Jira as a seamless extension of your team.', 'Services'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'Do we get our own dedicated testers?');

INSERT INTO public.faqs (question, answer, category)
SELECT 'What kind of testing tools do you use?', 'We use modern industry standards tailored to your stack—predominantly Playwright, Cypress, Selenium, JMeter, k6, and Postman, alongside custom CI/CD integrations.', 'Technology'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'What kind of testing tools do you use?');

INSERT INTO public.faqs (question, answer, category)
SELECT 'Do you test on real phones or just emulators?', 'A hybrid of both! We run exploratory and validation passes on real physical iOS and Android devices, complemented by device clouds for high-speed matrix test runs.', 'Mobile'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'Do you test on real phones or just emulators?');

INSERT INTO public.faqs (question, answer, category)
SELECT 'Have you worked with apps in our industry?', 'Yes! We have validated platforms across Fintech, E-commerce, Healthcare, EdTech, Logistics, and B2B SaaS applications with strict compliance needs.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'Have you worked with apps in our industry?');

INSERT INTO public.faqs (question, answer, category)
SELECT 'How do you report bugs to us?', 'No confusing spreadsheets. We file clear, reproducible defect tickets directly into your Jira, GitHub, Linear, or Trello, complete with screen recordings, logs, and reproduction steps.', 'Process'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs WHERE question = 'How do you report bugs to us?');

-- 4. Storage Bucket Policies for public_assets
-- Ensure public_assets bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_assets', 'public_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated admins and bloggers to upload to public_assets
DROP POLICY IF EXISTS "Admins can upload assets" ON storage.objects;
CREATE POLICY "Admins can upload assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'public_assets' AND (
      public.is_admin() OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin', 'blogger') OR public.has_module_permission('blog', 'edit'))
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update assets" ON storage.objects;
CREATE POLICY "Admins can update assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'public_assets' AND (
      public.is_admin() OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin', 'blogger') OR public.has_module_permission('blog', 'edit'))
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete assets" ON storage.objects;
CREATE POLICY "Admins can delete assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'public_assets' AND (
      public.is_admin() OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin', 'blogger') OR public.has_module_permission('blog', 'edit'))
      )
    )
  );

DROP POLICY IF EXISTS "Public can read assets" ON storage.objects;
CREATE POLICY "Public can read assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'public_assets');
