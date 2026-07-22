import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    // Sadece admin oturumu açık olanlar bu kontrolü yapabilsin
    await requireAdmin(); 

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: "Şifre girilmedi." }, { status: 400 });
    }

    // Environment değişkenleri kontrolü (Hem düz şifre hem Hash destekli)
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";

    if (!envPasswordHash) {
      return NextResponse.json({ success: false, error: "Sunucu hatası: Sistemde şifre tanımlı değil." }, { status: 500 });
    }

    let isMatch = false;

    // Eğer şifre bcrypt formatındaysa ( $2a$ veya $2b$ ile başlar)
    if (envPasswordHash.startsWith("$2a$") || envPasswordHash.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, envPasswordHash);
    } else {
      // Düz metin olarak tanımlandıysa direkt karşılaştır
      isMatch = password === envPasswordHash;
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Şifre yanlış." }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify Password Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}