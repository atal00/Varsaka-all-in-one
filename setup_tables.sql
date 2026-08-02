-- Run this query in the Supabase SQL Editor to create all necessary tables

-- Enable UUID extension (useful for ID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure the new correct schema is applied
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service TEXT,
  message TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client TEXT NOT NULL,
  company TEXT,
  text TEXT,
  rating INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  internship_role TEXT,
  project_title TEXT,
  mentor_name TEXT,
  grade TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  issue_date DATE,
  cert_year TEXT,
  cert_num TEXT,
  certificate_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Optional: Enable Row Level Security (RLS) on all tables
-- This ensures security, but you will need to add RLS policies 
-- to allow access from the frontend if they aren't accessed via Service Role key.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Temporary bypass policies so public can read standard data (Adjust as needed)
CREATE POLICY "Public can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public can read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public can read blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
