import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fonksiyonun adını Next.js 16 standartlarına göre "proxy" olarak güncelledik
export function proxy(request: NextRequest) {
  // Sadece /admin ile başlayan sayfalara girmeye çalışanları denetle
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    // Tarayıcıda bizim gizli şifremizi taşıyan çerez yoksa, Login sayfasına geri şutla
    if (token !== 'studio_secret_key_2026') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Bu denetimin çalışacağı rotaları belirliyoruz
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};