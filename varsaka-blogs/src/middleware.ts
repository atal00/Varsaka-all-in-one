import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Fallback values ensure edge initialization never throws TypeError: Invalid URL
const FALLBACK_SUPABASE_URL = 'https://hxexoazbnbtqhyytxitq.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. FAST PATH: Public blog routes never execute auth or Supabase edge calls
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // 2. PROTECTED ROUTES (/dashboard/*): Safe execution with error boundary
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      // Unauthenticated access to dashboard: securely redirect to official Portal login
      return NextResponse.redirect(new URL('https://loginto.varsaka.com'))
    }

    // RBAC Guard for Blogs App
    const { data: profile } = await supabase
      .from('profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (profile?.permissions && profile.permissions.access_blogs === false) {
      return NextResponse.redirect(new URL('https://loginto.varsaka.com?error=access_denied'))
    }

    return supabaseResponse
  } catch (error) {
    console.error('[Varsaka-Blogs Middleware Error]', error)
    // Never throw 500 MIDDLEWARE_INVOCATION_FAILED — safely redirect protected requests
    return NextResponse.redirect(new URL('https://loginto.varsaka.com'))
  }
}

// Scoped strictly to protected dashboard routes — public blog routes bypass edge middleware entirely
export const config = {
  matcher: ['/dashboard/:path*'],
}
