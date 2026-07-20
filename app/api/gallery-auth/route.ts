import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { galleryId, password } = body;

    if (!galleryId || !password) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    await connectToDatabase();
    const gallery = await Gallery.findById(galleryId);

    if (!gallery) {
      return NextResponse.json({ error: "Galeri bulunamadı." }, { status: 404 });
    }

    // BCRYPT İPTAL EDİLDİ. Düz metin olarak müşterinin girdiği ile veritabanındaki eşleşiyor mu diye bakıyoruz.
    if (gallery.password !== password) {
      return NextResponse.json({ error: "Hatalı şifre, lütfen tekrar deneyin." }, { status: 401 });
    }

    // Şifre Doğruysa -> 3 Saatlik Güvenli Cookie (Oturum) Oluştur
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "omer_studio_secret");
    const token = await new SignJWT({ galleryId, password: gallery.password })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("3h") // "7d" (7 gün) yerine "3h" (3 saat) yaptık
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(`gallery_auth_${galleryId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 3, // 60 saniye * 60 dakika * 3 saat (Matematiği 3 saate çektik)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}