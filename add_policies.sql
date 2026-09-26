-- =========================================================================
-- Hardened Role-Based Row Level Security (RLS) Policies for Varsaka Labs
-- Principle of Least Privilege: Role-Enforced Server-Side Access Control
-- =========================================================================

-- 1. Helper Security Functions (SECURITY DEFINER with fixed search_path)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'employee') FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_blogs()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'blogger') OR (permissions->>'manage_blogs')::boolean = true 
     FROM public.profiles WHERE id = auth.uid()), 
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_manage_blogs() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_blogs() TO authenticated;

-- =========================================================================
-- 2. Profiles Table Policies & Field Immutability Trigger
-- =========================================================================

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
REVOKE ALL ON public.profiles FROM anon, public, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- SELECT: Normal users see ONLY their own row; Admins see all rows
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- UPDATE: Non-admins target only own row; Admins can target any row
-- (Field-level immutability is strictly enforced by the trigger below)
CREATE POLICY "Users can update permitted profile rows" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- BEFORE UPDATE Trigger enforcing immutable fields & anti-privilege escalation
CREATE OR REPLACE FUNCTION public.trg_protect_profiles_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. ALWAYS verify ID is immutable for EVERYONE (Admins and Non-Admins)
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Access denied: Profile ID is immutable.';
  END IF;

  -- 2. ALWAYS verify Email is immutable via profile update for EVERYONE
  -- (Email changes must use Supabase Auth workflows, not direct profile updates)
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Access denied: Email address cannot be modified via profile update.';
  END IF;

  -- 3. If caller is Administrator, allow permitted admin fields (role, permissions, full_name)
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- 4. If caller is NOT Administrator:
  -- 4a. Must only update their own record
  IF auth.uid() IS NULL OR auth.uid() != OLD.id THEN
    RAISE EXCEPTION 'Access denied: You can only update your own profile.';
  END IF;

  -- 4b. Role cannot be changed by non-admins
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Access denied: Modifying role requires administrator privileges.';
  END IF;

  -- 4c. Permissions cannot be changed by non-admins
  IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
    RAISE EXCEPTION 'Access denied: Modifying permissions requires administrator privileges.';
  END IF;

  -- 4d. Safe fields allowed (full_name)
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
-- 2b. Restricted staff_directory View for Internal Team Assignment
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

-- Restrict view: ZERO anonymous or public access; ONLY authenticated SELECT
REVOKE ALL ON public.staff_directory FROM anon, public, authenticated;
GRANT SELECT ON public.staff_directory TO authenticated;

-- 3. Leads Table Policies (CRITICAL: Client Data Protection)
-- Anonymous: Can only insert (submit contact form). Cannot read, update, or delete.
-- Staff (admin, employee): Can view and update lead status/notes.
-- Only Admin: Can permanently delete leads.
DROP POLICY IF EXISTS "Allow authenticated users all actions on leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Staff can read leads" ON public.leads;
DROP POLICY IF EXISTS "Staff can update leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Only admins can delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 4. Certificates Table Policies
-- Public: Can verify certificates by reading them.
-- Only Admin: Can generate, edit, or delete certificates.
DROP POLICY IF EXISTS "Allow authenticated users all actions on certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public can read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Only admins can delete certificates" ON public.certificates;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read certificates" ON public.certificates
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Only admins can insert certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update certificates" ON public.certificates
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete certificates" ON public.certificates
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 5. Blogs Table Policies
-- Public: Can read published blogs.
-- Staff/Blogger: Can read all blogs (including drafts).
-- Blogger/Admin: Can insert, update, or delete blogs.
DROP POLICY IF EXISTS "Allow authenticated users all actions on blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can read all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blog managers can delete blogs" ON public.blogs;

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published blogs" ON public.blogs
  FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "Blog managers can read all blogs" ON public.blogs
  FOR SELECT TO authenticated
  USING (public.can_manage_blogs() OR public.is_staff() OR status = 'published');

CREATE POLICY "Blog managers can insert blogs" ON public.blogs
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_blogs());

CREATE POLICY "Blog managers can update blogs" ON public.blogs
  FOR UPDATE TO authenticated
  USING (public.can_manage_blogs())
  WITH CHECK (public.can_manage_blogs());

CREATE POLICY "Blog managers can delete blogs" ON public.blogs
  FOR DELETE TO authenticated
  USING (public.can_manage_blogs());

-- 6. Services, Testimonials, FAQs Table Policies
-- Public: Read-only access.
-- Admin: Full management.
DROP POLICY IF EXISTS "Allow authenticated users all actions on services" ON public.services;
DROP POLICY IF EXISTS "Public can read services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read services" ON public.services
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated users all actions on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read testimonials" ON public.testimonials
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated users all actions on faqs" ON public.faqs;
DROP POLICY IF EXISTS "Public can read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read faqs" ON public.faqs
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


