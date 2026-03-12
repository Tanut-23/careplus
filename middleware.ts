import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check for auth session
  const sessionCookie = request.cookies.get('authjs.session-token') || 
                        request.cookies.get('__Secure-authjs.session-token') ||
                        request.cookies.get('next-auth.session-token') ||
                        request.cookies.get('__Secure-next-auth.session-token')

  // Check if the path is an admin path
  const isAdminPath = (pathname.includes('/admin') || pathname.endsWith('/admin')) && !pathname.includes('/admin/login')
  const isLoginPage = pathname.includes('/admin/login')
  
  // Extract locale from pathname (e.g., /th/admin -> th)
  const segments = pathname.split('/')
  const locale = routing.locales.includes(segments[1] as any) ? segments[1] : 'th'

  if (isAdminPath && !sessionCookie) {
    const loginUrl = new URL(`/${locale}/admin/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && sessionCookie) {
    const adminUrl = new URL(`/${locale}/admin`, request.url)
    return NextResponse.redirect(adminUrl)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(th|en)/:path*'],
}
