-- =========================================================================
-- Hardened Role-Based Row Level Security (RLS) & Granular RBAC Policies
-- Varsaka Labs Enterprise Security Architecture
-- =========================================================================

-- 1. Helper Security Functions (SECURITY DEFINER with fixed search_path and row_security = off)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
  SELECT COALESCE(
    (SELECT LOWER(TRIM(role)) = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
  SELECT COALESCE(
    (SELECT LOWER(TRIM(role)) IN ('admin', 'employee') FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_blogs()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
  SELECT COALESCE(
    (SELECT LOWER(TRIM(role)) IN ('admin', 'blogger') OR (permissions->>'manage_blogs')::boolean = true OR (permissions->'media'->>'edit')::boolean = true
     FROM public.profiles WHERE id = auth.uid()), 
     false
  );
$$;

-- 🛡️ Granular Module Permission Checker
-- Checks whether caller has admin role OR explicit module/action permission
CREATE OR REPLACE FUNCTION public.has_module_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
DECLARE
  v_role TEXT;
  v_perms JSONB;
BEGIN
  SELECT role, permissions INTO v_role, v_perms
  FROM public.profiles
  WHERE id = auth.uid();

  -- Administrators inherently possess all module permissions
  IF LOWER(TRIM(v_role)) = 'admin' THEN
    RETURN true;
  END IF;

  IF v_perms IS NULL THEN
    RETURN false;
  END IF;

  -- Check granular action permission
  RETURN COALESCE((v_perms->p_module->>p_action)::boolean, false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_manage_blogs() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_module_permission(TEXT, TEXT) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_blogs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_module_permission(TEXT, TEXT) TO authenticated;

-- =========================================================================
-- 2. Profiles Table Schema Hardening, Policies & Field Immutability Trigger
-- =========================================================================

-- Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Backfill missing email addresses safely from auth.users
UPDATE public.profiles p 
SET email = u.email 
FROM auth.users u 
WHERE p.id = u.id AND p.email IS NULL;

-- Drop all legacy and overly-permissive policies on profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own non-sensitive profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own name only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated staff can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update permitted profile rows" ON public.profiles;

-- Ensure RLS is active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Revoke all table-level access, then grant ONLY SELECT and UPDATE to authenticated
REVOKE ALL ON public.profiles FROM anon, public;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- SELECT: Caller can read own profile OR if admin OR if granted users.view permission
CREATE POLICY "Authorized users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin() OR public.has_module_permission('users', 'view'));

-- UPDATE: Caller can update own profile OR if admin OR if granted users.edit permission
CREATE POLICY "Authorized users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin() OR public.has_module_permission('users', 'edit'))
  WITH CHECK (auth.uid() = id OR public.is_admin() OR public.has_module_permission('users', 'edit'));

-- BEFORE UPDATE Trigger enforcing immutable fields & anti-privilege escalation & last-admin protection
CREATE OR REPLACE FUNCTION public.trg_protect_profiles_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
DECLARE
  v_admin_count INT;
BEGIN
  -- 1. ALWAYS verify ID is immutable for EVERYONE
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Access denied: Profile ID is immutable.';
  END IF;

  -- 2. ALWAYS verify Email is immutable via profile update for EVERYONE
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Access denied: Email address cannot be modified via profile update.';
  END IF;

  -- 3. Self-demotion check: An admin cannot demote themselves from admin role
  IF OLD.role = 'admin' AND NEW.role != 'admin' AND auth.uid() = OLD.id THEN
    RAISE EXCEPTION 'Access denied: Administrators cannot demote themselves.';
  END IF;

  -- 4. Last-admin protection: Cannot demote or disable the last active administrator
  IF OLD.role = 'admin' AND (NEW.role != 'admin' OR (NEW.permissions->>'is_disabled')::boolean = true) THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles
    WHERE role = 'admin' 
      AND id != OLD.id 
      AND COALESCE((permissions->>'is_disabled')::boolean, false) = false;
      
    IF v_admin_count = 0 THEN
      RAISE EXCEPTION 'Access denied: Cannot demote or disable the last remaining active administrator.';
    END IF;
  END IF;

  -- 5. Anti-privilege escalation check:
  -- Only an Administrator can change role, permissions, or disabled status.
  -- Employees with 'users.edit' or users editing their own profile CANNOT alter role or permissions.
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Modifying user role requires super-administrator privileges.';
  END IF;

  IF NEW.permissions IS DISTINCT FROM OLD.permissions AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Modifying user permissions or status requires super-administrator privileges.';
  END IF;

  -- 6. Caller authorization check:
  -- Admin can update any profile.
  -- User with users.edit can update other profiles (e.g. full_name).
  -- Normal employee can only update their own profile.
  IF NOT (public.is_admin() OR public.has_module_permission('users', 'edit') OR (auth.uid() IS NOT NULL AND auth.uid() = OLD.id)) THEN
    RAISE EXCEPTION 'Access denied: You can only update your own profile.';
  END IF;

  -- 7. Safe field update allowed (full_name)
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_protect_profiles_update() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.trg_protect_profiles_update() TO authenticated;

DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_integrity
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_protect_profiles_update();

-- =========================================================================
-- 2b. Secure get_admin_users RPC Function
-- Exposes safe profile and authentication status without leaking credentials
-- Note: created_at is safely sourced from auth.users (not public.profiles)
-- =========================================================================
DROP FUNCTION IF EXISTS public.get_admin_users();
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  role TEXT,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  -- Strict permission check: caller must be admin OR have users.view permission
  IF NOT (public.is_admin() OR public.has_module_permission('users', 'view')) THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to view staff directory.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', 'User') AS full_name,
    COALESCE(p.email, u.email) AS email,
    COALESCE(p.role, 'employee') AS role,
    p.permissions,
    COALESCE(u.created_at, now()) AS created_at,
    u.last_sign_in_at,
    CASE 
      WHEN u.banned_until IS NOT NULL AND u.banned_until > now() THEN 'disabled'
      WHEN (p.permissions->>'is_disabled')::boolean = true THEN 'disabled'
      ELSE 'active'
    END AS status
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY u.created_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_users() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- =========================================================================
-- 2c. Restricted staff_directory View for Internal Team Assignment
-- =========================================================================

CREATE OR REPLACE VIEW public.staff_directory
WITH (security_barrier = true)
AS
SELECT 
  id,
  full_name,
  email
FROM public.profiles
WHERE role IN ('admin', 'employee')
  AND public.is_staff();

REVOKE ALL ON public.staff_directory FROM anon, public;
GRANT SELECT ON public.staff_directory TO authenticated;

-- =========================================================================
-- 3. Security Logs (Audit Trail) Table & Policies
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.security_logs FROM anon, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.security_logs FROM authenticated;
GRANT SELECT ON public.security_logs TO authenticated;

DROP POLICY IF EXISTS "Staff with view permission can read security logs" ON public.security_logs;
CREATE POLICY "Staff with view permission can read security logs" ON public.security_logs
  FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_module_permission('security_logs', 'view'));

-- Direct INSERT, UPDATE, and DELETE are strictly denied to all client roles.
-- There are NO INSERT/UPDATE/DELETE policies, and INSERT permission is revoked.
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.security_logs;

-- 🛡️ SECURITY DEFINER RPC: Trusted server-side audit logging
-- Requirements strictly enforced:
-- 1. actor_id is derived strictly from auth.uid()
-- 2. actor_email is extracted from trusted server-side auth/profiles data
-- 3. Frontend CANNOT impersonate another actor
-- 4. search_path = public, pg_temp protects against search_path hijacking
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_target_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_email text;
  v_log_id uuid;
  v_is_admin boolean;
BEGIN
  -- Defensive authentication check: anonymous execution is strictly rejected
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 🛡️ Step 1: Explicit Action Allowlist Validation
  IF p_action NOT IN (
    'login_success',
    'logout_success',
    'certificate_created',
    'certificate_deleted',
    'permissions_changed',
    'user_permissions_changed',
    'user_role_changed',
    'user_disabled',
    'user_enabled',
    'user_deleted',
    'lead_assigned',
    'care_request_updated',
    'care_request_status_changed',
    'service_created',
    'service_updated',
    'service_deleted',
    'blog_created',
    'blog_updated',
    'blog_published',
    'blog_deleted',
    'case_study_created',
    'case_study_updated',
    'case_study_deleted',
    'career_created',
    'career_updated',
    'career_deleted',
    'testimonial_created',
    'testimonial_updated',
    'testimonial_approved',
    'testimonial_deleted',
    'faq_created',
    'faq_updated',
    'faq_deleted'
  ) THEN
    RAISE EXCEPTION 'Invalid or unsupported audit action: %', p_action;
  END IF;

  -- Derive actor_id strictly from session context; never from client parameters
  v_actor_id := auth.uid();
  v_is_admin := public.is_admin();

  -- 🛡️ Step 2: Sensitive Audit Action Authorization Check
  -- Critical user administration events may ONLY be emitted by authorized administrators
  IF p_action IN (
    'permissions_changed',
    'user_permissions_changed',
    'user_role_changed',
    'user_disabled',
    'user_enabled',
    'user_deleted'
  ) THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Access denied: Action "%" requires administrator privileges', p_action;
    END IF;
  END IF;

  -- Certificate deletion audit events require certificate delete permission or admin
  IF p_action = 'certificate_deleted' THEN
    IF NOT (v_is_admin OR public.has_module_permission('certificates', 'delete')) THEN
      RAISE EXCEPTION 'Access denied: certificate_deleted requires delete permission';
    END IF;
  END IF;

  -- Certificate creation audit events require certificate create permission or admin
  IF p_action = 'certificate_created' THEN
    IF NOT (v_is_admin OR public.has_module_permission('certificates', 'create')) THEN
      RAISE EXCEPTION 'Access denied: certificate_created requires create permission';
    END IF;
  END IF;

  -- Derive actor_email strictly from trusted server-side tables
  SELECT COALESCE(p.email, u.email::text)
  INTO v_actor_email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = v_actor_id;

  INSERT INTO public.security_logs (
    actor_id,
    actor_email,
    action,
    target_id,
    metadata,
    created_at
  ) VALUES (
    v_actor_id,
    v_actor_email,
    p_action,
    p_target_id,
    COALESCE(p_metadata, '{}'::jsonb),
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb) TO authenticated;

-- =========================================================================
-- 4. Certificates Table Policies & Granular RBAC Deletion
-- =========================================================================

ALTER TABLE public.certificates 
  ADD COLUMN IF NOT EXISTS public_verification_token UUID UNIQUE DEFAULT gen_random_uuid();

UPDATE public.certificates 
  SET public_verification_token = gen_random_uuid() 
  WHERE public_verification_token IS NULL;

ALTER TABLE public.certificates 
  ALTER COLUMN public_verification_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_verification_token 
  ON public.certificates(public_verification_token);

DROP POLICY IF EXISTS "Allow authenticated users all actions on certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public can read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public can view valid certificates" ON public.certificates;
DROP POLICY IF EXISTS "Staff can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can delete certificates" ON public.certificates;
DROP POLICY IF EXISTS "Authorized users can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Authorized users can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Authorized users can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Authorized users can delete certificates" ON public.certificates;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.certificates FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.certificates TO authenticated;

-- SELECT: Admins or users with certificates.view
CREATE POLICY "Authorized users can view certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_module_permission('certificates', 'view'));

-- INSERT: Admins or users with certificates.create
CREATE POLICY "Authorized users can insert certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('certificates', 'create'));

-- UPDATE: Admins or users with certificates.edit
CREATE POLICY "Authorized users can update certificates" ON public.certificates
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('certificates', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('certificates', 'edit'));

-- DELETE: Admins or users with certificates.delete
CREATE POLICY "Authorized users can delete certificates" ON public.certificates
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('certificates', 'delete'));

-- 🛡️ SECURE PUBLIC VERIFICATION RPC FUNCTION
-- Accepts ONLY a cryptographically secure UUIDv4 token.
-- Query filters on certificates. If certificate was deleted, returns 0 rows immediately.
DROP FUNCTION IF EXISTS public.verify_certificate_by_token(UUID);
CREATE OR REPLACE FUNCTION public.verify_certificate_by_token(p_token UUID)
RETURNS TABLE (
  full_name TEXT,
  internship_role TEXT,
  project_title TEXT,
  mentor_name TEXT,
  grade TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  issue_date DATE,
  certificate_id TEXT,
  public_verification_token UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.full_name,
    c.internship_role,
    c.project_title,
    c.mentor_name,
    c.grade,
    c.location,
    c.start_date,
    c.end_date,
    c.issue_date,
    c.certificate_id,
    c.public_verification_token
  FROM public.certificates c
  WHERE c.public_verification_token = p_token
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate_by_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_token(UUID) TO anon, authenticated;

-- =========================================================================
-- 5. Leads Table Policies (CRITICAL: Client Data Protection)
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated users all actions on leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Staff can read leads" ON public.leads;
DROP POLICY IF EXISTS "Staff can update leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Authorized users can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authorized users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authorized users can delete leads" ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authorized users can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_module_permission('leads', 'view') OR assigned_to = auth.uid());

CREATE POLICY "Authorized users can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('leads', 'edit') OR assigned_to = auth.uid())
  WITH CHECK (public.is_admin() OR public.has_module_permission('leads', 'edit') OR assigned_to = auth.uid());

CREATE POLICY "Authorized users can delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('leads', 'delete'));

-- =========================================================================
-- 6. Blogs Table Policies
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated users all actions on blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can read all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can delete blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authorized users can view blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authorized users can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authorized users can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authorized users can delete blogs" ON public.blogs;

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view blogs" ON public.blogs
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_admin() OR public.has_module_permission('blog', 'view'));

CREATE POLICY "Authorized users can insert blogs" ON public.blogs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('blog', 'create'));

CREATE POLICY "Authorized users can update blogs" ON public.blogs
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('blog', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('blog', 'edit'));

CREATE POLICY "Authorized users can delete blogs" ON public.blogs
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('blog', 'delete'));

-- =========================================================================
-- 7. Services Table Policies
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated users all actions on services" ON public.services;
DROP POLICY IF EXISTS "Public can read services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Authorized users can view services" ON public.services;
DROP POLICY IF EXISTS "Authorized users can insert services" ON public.services;
DROP POLICY IF EXISTS "Authorized users can update services" ON public.services;
DROP POLICY IF EXISTS "Authorized users can delete services" ON public.services;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view services" ON public.services
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR public.is_admin() OR public.has_module_permission('services', 'view'));

CREATE POLICY "Authorized users can insert services" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('services', 'create'));

CREATE POLICY "Authorized users can update services" ON public.services
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('services', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('services', 'edit'));

CREATE POLICY "Authorized users can delete services" ON public.services
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('services', 'delete'));

-- =========================================================================
-- 8. Testimonials Table Policies
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated users all actions on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authorized users can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authorized users can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authorized users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authorized users can delete testimonials" ON public.testimonials;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR status = 'active' OR public.is_admin() OR public.has_module_permission('testimonials', 'view'));

CREATE POLICY "Authorized users can insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('testimonials', 'create'));

CREATE POLICY "Authorized users can update testimonials" ON public.testimonials
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('testimonials', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('testimonials', 'edit'));

CREATE POLICY "Authorized users can delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('testimonials', 'delete'));

-- =========================================================================
-- 9. FAQs Table Policies
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated users all actions on faqs" ON public.faqs;
DROP POLICY IF EXISTS "Public can read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authorized users can view faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authorized users can insert faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authorized users can update faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authorized users can delete faqs" ON public.faqs;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view faqs" ON public.faqs
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authorized users can insert faqs" ON public.faqs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('faqs', 'create'));

CREATE POLICY "Authorized users can update faqs" ON public.faqs
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('faqs', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('faqs', 'edit'));

CREATE POLICY "Authorized users can delete faqs" ON public.faqs
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('faqs', 'delete'));

-- =========================================================================
-- 10. Case Studies Table Policies
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.case_studies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client TEXT NOT NULL,
  tag TEXT NOT NULL,
  icon TEXT DEFAULT 'fa-chart-line',
  outcome TEXT NOT NULL,
  "desc" TEXT,
  description TEXT,
  content TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

DROP POLICY IF EXISTS "Allow authenticated users all actions on case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Public can read case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authorized users can view case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authorized users can insert case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authorized users can update case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authorized users can delete case_studies" ON public.case_studies;

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view case_studies" ON public.case_studies
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authorized users can insert case_studies" ON public.case_studies
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('case_studies', 'create'));

CREATE POLICY "Authorized users can update case_studies" ON public.case_studies
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('case_studies', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('case_studies', 'edit'));

CREATE POLICY "Authorized users can delete case_studies" ON public.case_studies
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('case_studies', 'delete'));

-- =========================================================================
-- 11. Careers / Jobs Table Policies
-- =========================================================================
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

DROP POLICY IF EXISTS "Allow authenticated users all actions on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can read jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authorized users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authorized users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authorized users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authorized users can delete jobs" ON public.jobs;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view jobs" ON public.jobs
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authorized users can insert jobs" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_module_permission('careers', 'create'));

CREATE POLICY "Authorized users can update jobs" ON public.jobs
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('careers', 'edit'))
  WITH CHECK (public.is_admin() OR public.has_module_permission('careers', 'edit'));

CREATE POLICY "Authorized users can delete jobs" ON public.jobs
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_module_permission('careers', 'delete'));
