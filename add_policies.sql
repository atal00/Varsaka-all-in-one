-- RLS Policies for Authenticated Users (Admin & Employees)

-- Profiles Policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
CREATE POLICY "Allow authenticated users to read profiles" ON profiles 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
CREATE POLICY "Allow authenticated users to update their own profile" ON profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Services Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on services" ON services;
CREATE POLICY "Allow authenticated users all actions on services" ON services 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blogs Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on blogs" ON blogs;
CREATE POLICY "Allow authenticated users all actions on blogs" ON blogs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Testimonials Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on testimonials" ON testimonials;
CREATE POLICY "Allow authenticated users all actions on testimonials" ON testimonials 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- FAQs Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on faqs" ON faqs;
CREATE POLICY "Allow authenticated users all actions on faqs" ON faqs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Certificates Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on certificates" ON certificates;
CREATE POLICY "Allow authenticated users all actions on certificates" ON certificates 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Leads Policies
DROP POLICY IF EXISTS "Allow authenticated users all actions on leads" ON leads;
CREATE POLICY "Allow authenticated users all actions on leads" ON leads 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
