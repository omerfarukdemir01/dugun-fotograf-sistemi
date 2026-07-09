import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

// POST isteği: Yeni bir veri kaydetmek için kullanılır
export async function POST(request: Request) {
  try {
    // 1. Gelen form verilerini oku
    const { title, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
    }

    // 2. Veritabanına bağlan
    await connectToDatabase();

    // 3. Veritabanında yeni bir galeri dökümanı oluştur
    const newGallery = await Gallery.create({
      title,
      date,
    });

    // 4. Başarılı sonucunu tarayıcıya geri dön
    return NextResponse.json({ success: true, data: newGallery }, { status: 201 });

  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Veritabanına kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}