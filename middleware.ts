import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { pathname } = request.nextUrl;

    // Public routes — no auth required (Note: using dash here is internal to middleware comment)
    const publicRoutes = ['/login', '/register', '/share', '/shared', '/', '/terms', '/privacy', '/free-analysis'];
    const isPublic = publicRoutes.some((r) => pathname === r || (r !== '/' && pathname.startsWith(r)));

    // API routes — handle auth server-side
    if (pathname.startsWith('/api')) {
        return supabaseResponse;
    }

    // Attempt to get the user with a hard timeout so the Edge function
    // never hangs long enough for Vercel to issue a 504.
    let user = null;
    try {
        const result = await Promise.race([
            supabase.auth.getUser(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('auth timeout')), 1200)
            ),
        ]);
        user = (result as Awaited<ReturnType<typeof supabase.auth.getUser>>).data.user;
    } catch {
        // Supabase unreachable or timed out — treat as unauthenticated.
        // Public pages will load normally; protected pages redirect to login.
    }

    // Redirect to login if accessing protected route without session
    if (!user && !isPublic && pathname !== '/') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect logged-in users away from auth pages
    if (user && (pathname === '/login' || pathname === '/register')) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|md|rtf|docx|csv|xlsx)$).*)',
    ],
};
