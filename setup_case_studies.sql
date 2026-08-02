-- SQL Migration to create Case Studies table, add RLS policies, and seed default data

-- 1. Create Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client TEXT NOT NULL,
  tag TEXT,
  icon TEXT DEFAULT 'fa-briefcase',
  outcome TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Public can read case_studies" ON case_studies;
CREATE POLICY "Public can read case_studies" ON case_studies 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users all actions on case_studies" ON case_studies;
CREATE POLICY "Allow authenticated users all actions on case_studies" ON case_studies 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Seed Default Case Studies safely
INSERT INTO case_studies (client, tag, icon, outcome, description)
SELECT 'Ourfab Technologies', 'Security Testing', 'fa-shield-halved', 'Critical Security Risks Remediated Post-Audit', 'Conducted a comprehensive OWASP security audit on their fintech platform. Identified and helped the engineering team remediate several critical vulnerabilities before the public production release.'
WHERE NOT EXISTS (SELECT 1 FROM case_studies WHERE client = 'Ourfab Technologies');

INSERT INTO case_studies (client, tag, icon, outcome, description)
SELECT 'TakeCare360', 'AI-Powered Testing', 'fa-robot', 'Test Coverage Expanded to 85%+', 'Implemented AI-assisted test generation to bridge existing coverage gaps. Successfully expanded the automated test suite to cover critical edge cases in their healthcare platform.'
WHERE NOT EXISTS (SELECT 1 FROM case_studies WHERE client = 'TakeCare360');

INSERT INTO case_studies (client, tag, icon, outcome, description)
SELECT 'RetailEdge India', 'Performance Testing', 'fa-gauge-high', 'System Reliability Improved Under Load', 'Performed targeted load and stress testing using JMeter. Identified performance bottlenecks in the checkout flow, leading to infrastructure optimizations for peak traffic periods.'
WHERE NOT EXISTS (SELECT 1 FROM case_studies WHERE client = 'RetailEdge India');

INSERT INTO case_studies (client, tag, icon, outcome, description)
SELECT 'Techtd Platform', 'Automation', 'fa-bolt-lightning', 'Regression Testing Time Significantly Optimized', 'Developed a custom Cypress automation framework integrated with their CI/CD pipeline. Successfully reduced the manual regression effort, allowing faster feedback for developers.'
WHERE NOT EXISTS (SELECT 1 FROM case_studies WHERE client = 'Techtd Platform');
