import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Refreshes the Supabase session cookie on every request and gates /admin.
 * Membership in `profiles` is what makes a signed-in user staff, so an
 * ordinary auth user with no profile row is bounced like a stranger.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials there is no session to read and no way to verify
  // staff. Refuse entry to /admin rather than throwing -- a missing env var
  // on the host must not be able to take the public site down with it.
  if (!url || !anonKey) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const target = request.nextUrl.clone();
      target.pathname = '/admin/login';
      target.searchParams.set('error', 'not_configured');
      return request.nextUrl.pathname === '/admin/login'
        ? response
        : NextResponse.redirect(target);
    }
    return response;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'not_staff');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Only the dashboard needs a session. Public pages show no auth state, so
// running this on every request would cost latency and buy nothing.
export const config = {
  matcher: ['/admin/:path*'],
};
