import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  try {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('better-auth.session_token');
    
    // Redirect to login if not authenticated
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For authenticated users, check onboarding status
    // Note: We'll implement proper session validation in the actual pages
    // The middleware just handles basic route protection
    
    // If user is trying to access onboarding when already complete
    if (pathname.startsWith('/onboarding')) {
      // TODO: Check if onboarding is actually complete
      // For now, allow access to onboarding pages
      return NextResponse.next();
    }

    // If user is trying to access app pages, ensure onboarding is complete
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/marketplace') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/roast')
    ) {
      // TODO: Check onboarding status and redirect if incomplete
      // For now, allow access - actual onboarding check will be in page components
      return NextResponse.next();
    }

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};