import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/session";

// Rate Limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ATTEMPTS = 5;

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  
  console.log("--- API/LOGIN TETİKLENDİ ---"); // Bunu en başa ekle
  
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const now = Date.now();
    
    const clientData = rateLimitMap.get(ip) || { count: 0, lastReset: now };
    
    if (now - clientData.lastReset > RATE_LIMIT_WINDOW) {
      clientData.count = 0;
      clientData.lastReset = now;
    }
    
    if (clientData.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Çok fazla hatalı deneme yaptınız." },
        { status: 429 } 
      );
    }
    
    clientData.count += 1;
    rateLimitMap.set(ip, clientData);

    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    }

    const { username, password } = result.data;

    // Kullanıcı adı kontrolü
    if (username !== process.env.ADMIN_USERNAME) {
      return NextResponse.json({ success: false, error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    // Şifre kontrolü
    const passwordOk = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH!
    );

    if (!passwordOk) {
      return NextResponse.json({ success: false, error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    rateLimitMap.delete(ip);
    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}