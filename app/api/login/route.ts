import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // .env.local dosyasındaki gerçek bilgilerle tarayıcıdan gelenleri karşılaştırıyoruz
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Giriş başarılıysa tarayıcıya onay dönüyoruz
      return NextResponse.json({ success: true });
    }

    // Bilgiler yanlışsa hata dönüyoruz
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı!" }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: "Sistemsel bir hata oluştu." }, { status: 500 });
  }
}