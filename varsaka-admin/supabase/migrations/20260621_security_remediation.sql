-- ==========================================
-- VARSAKA LABS SECURITY REMEDIATION
-- RLS, RBAC, and Audit Logging
-- ==========================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure profiles table has a role column
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee' 
CHECK (role IN ('superadmin', 'admin', 'employee', 'guest'));

-- 3. Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Helper Functions for RBAC
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- POLICIES FOR LEADS
-- ==========================================
-- Drop existing policies if they exist to start clean
DROP POLICY IF EXISTS "Leads are viewable by assigned employee or admin" ON public.leads;
DROP POLICY IF EXISTS "Leads are insertable by admins" ON public.leads;
DROP POLICY IF EXISTS "Leads are updatable by assigned employee or admin" ON public.leads;
DROP POLICY IF EXISTS "Leads are deletable by admin" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

-- SELECT
CREATE POLICY "Admins can view all leads" 
ON public.leads FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can view assigned leads" 
ON public.leads FOR SELECT TO authenticated
USING (assigned_to = auth.uid());

-- INSERT (Public inserts are handled by backend with Service Role, so no public insert policy needed!)
CREATE POLICY "Admins can insert leads directly" 
ON public.leads FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Employees can insert leads" 
ON public.leads FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE
CREATE POLICY "Admins can update all leads" 
ON public.leads FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Employees can update assigned leads" 
ON public.leads FOR UPDATE TO authenticated
USING (assigned_to = auth.uid());

-- DELETE
CREATE POLICY "Only admins can delete leads" 
ON public.leads FOR DELETE TO authenticated
USING (public.is_admin());

-- ==========================================
-- POLICIES FOR PROFILES
-- ==========================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile (name only)" 
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "SuperAdmins can delete profiles" 
ON public.profiles FOR DELETE TO authenticated
USING (public.is_superadmin());

-- ==========================================
-- POLICIES FOR CERTIFICATES
-- ==========================================
DROP POLICY IF EXISTS "Certificates are publicly viewable" ON public.certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON public.certificates;

CREATE POLICY "Certificates are publicly viewable" 
ON public.certificates FOR SELECT
USING (true);

CREATE POLICY "Admins can insert certificates" 
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update certificates" 
ON public.certificates FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete certificates" 
ON public.certificates FOR DELETE TO authenticated
USING (public.is_admin());

-- ==========================================
-- POLICIES FOR AUDIT LOGS
-- ==========================================
CREATE POLICY "SuperAdmins can view audit logs" 
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_superadmin());

-- Nobody can update or delete audit logs!
-- Inserts are handled by database triggers.

-- ==========================================
-- AUDIT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.log_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS audit_leads_trigger ON public.leads;
CREATE TRIGGER audit_leads_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_action();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- ==========================================
-- SEED INITIAL SUPERADMIN (Replace with your UID)
-- ==========================================
-- Note: User must first exist in auth.users
-- UPDATE public.profiles SET role = 'superadmin' WHERE email = 'your.email@varsaka.com';
