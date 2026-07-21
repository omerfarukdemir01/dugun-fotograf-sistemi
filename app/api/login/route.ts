import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { connectToDatabase } from "@/lib/mongodb";
import LoginAttempt from "@/models/LoginAttempt";

const MAX_ATTEMPTS = 5;

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown_ip";

    await connectToDatabase();

    // 1. IP için veritabanındaki deneme kaydını kontrol et
    const attemptRecord = await LoginAttempt.findOne({ ip });

    if (attemptRecord && attemptRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Çok fazla hatalı deneme yaptınız. Lütfen 1 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    }

    const { username, password } = result.data;

    // Environment değişkenleri kontrolü
    const envUsername = process.env.ADMIN_USERNAME || "";
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";

    const isValidUsername = username === envUsername;
    let isValidPassword = false;

    if (isValidUsername && envPasswordHash) {
      if (envPasswordHash.startsWith("$2a$") || envPasswordHash.startsWith("$2b$")) {
        isValidPassword = await bcrypt.compare(password, envPasswordHash);
      } else {
        isValidPassword = password === envPasswordHash;
      }
    }

    if (!isValidUsername || !isValidPassword) {
      if (attemptRecord) {
        attemptRecord.attempts += 1;
        await attemptRecord.save();
      } else {
        await LoginAttempt.create({ ip, attempts: 1 });
      }

      return NextResponse.json({ success: false, error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    // Başarılı Giriş Yapıldıysa Deneme Kaydını Sil
    if (attemptRecord) {
      await LoginAttempt.deleteOne({ ip });
    }

    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}