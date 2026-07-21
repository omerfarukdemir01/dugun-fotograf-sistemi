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

    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminHash) {
      return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
    }

    // Girilen şifreyi güvenli hash ile karşılaştır
    const isMatch = await bcrypt.compare(password, adminHash);

    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Şifre yanlış." }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}