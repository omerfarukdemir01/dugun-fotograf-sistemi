import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

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

    let isMatch = false;

    if (gallery.password) {
      if (gallery.password.startsWith("$2a$") || gallery.password.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(password, gallery.password);
      } else {
        isMatch = (password === gallery.password);
      }
    }

    if (!isMatch) {
      return NextResponse.json({ error: "Hatalı şifre, lütfen tekrar deneyin." }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "omer_studio_secret");
    
    // ÇÖZÜM: O anki şifrenin hash'ini token içine 'hashKey' olarak ekliyoruz
    const token = await new SignJWT({ 
      galleryId, 
      isAuthorized: true,
      hashKey: gallery.password || "" 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("3h")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(`gallery_auth_${galleryId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 3, 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery Auth hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}