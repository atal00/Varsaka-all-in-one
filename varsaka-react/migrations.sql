-- ==========================================
-- Varsaka Admin Portal Database Migrations
-- ==========================================

-- 1. Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client TEXT NOT NULL,
    company TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Security: Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Policies: Allow public Read, Authenticated ALL
-- ==========================================

-- Services Policies
CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access services" ON public.services USING (auth.role() = 'authenticated');

-- Blogs Policies
CREATE POLICY "Allow public read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access blogs" ON public.blogs USING (auth.role() = 'authenticated');

-- Testimonials Policies
CREATE POLICY "Allow public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access testimonials" ON public.testimonials USING (auth.role() = 'authenticated');

-- FAQs Policies
CREATE POLICY "Allow public read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access faqs" ON public.faqs USING (auth.role() = 'authenticated');

-- ==========================================
-- SEED DATA (Optional: Insert some initial rows)
-- ==========================================

INSERT INTO public.services (name, category, status) VALUES 
('Functional Testing', 'Testing', 'active'),
('Security Testing', 'Cybersecurity', 'active'),
('AI-Powered Testing', 'AI', 'beta');

INSERT INTO public.blogs (title, status, views, date) VALUES 
('The Future of QA Automation', 'published', 1240, '2023-10-15'),
('How to secure your React Apps', 'draft', 0, '2023-11-01');

INSERT INTO public.testimonials (client, company, text, rating, status) VALUES 
('John Doe', 'TechCorp', 'Varsaka delivered outstanding testing services.', 5, 'approved'),
('Jane Smith', 'StartupInc', 'Incredible attention to detail.', 5, 'pending');

INSERT INTO public.faqs (question, answer, category) VALUES 
('What is your pricing?', 'We offer custom enterprise plans.', 'Billing'),
('Do you do mobile testing?', 'Yes, we test iOS and Android apps natively.', 'Services');

-- ==========================================
-- Schema Updates (v2 UI Improvements)
-- ==========================================

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS summary TEXT;
