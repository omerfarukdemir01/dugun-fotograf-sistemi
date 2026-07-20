import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

// Next.js 16 standartlarına göre "proxy" fonksiyonu
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // Login sayfası herkese açık
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Admin sayfaları için oturum gerekli
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // JWT token'ı doğrula
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Denetimin çalışacağı rotalar
export const config = {
  matcher: ["/admin/:path*"],
};