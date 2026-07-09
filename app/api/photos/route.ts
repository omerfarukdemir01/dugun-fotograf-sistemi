import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";

// Belirli bir galeriye ait fotoğrafları getiren GET isteği
export async function GET(request: Request) {
  try {
    // 1. URL'deki galleryId parametresini yakala (Örn: /api/photos?galleryId=123)
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");

    if (!galleryId) {
      return NextResponse.json({ error: "Galeri ID bulunamadı." }, { status: 400 });
    }

    // 2. Veritabanına bağlan
    await connectToDatabase();

    // 3. Sadece bu galeriye ait olan fotoğrafları en yeniden eskiye doğru sıralayarak bul
    const photos = await Photo.find({ galleryId }).sort({ createdAt: -1 });

    // 4. Fotoğrafları tarayıcıya gönder
    return NextResponse.json({ success: true, data: photos }, { status: 200 });

  } catch (error) {
    console.error("Fotoğraf Çekme Hatası:", error);
    return NextResponse.json({ error: "Fotoğraflar yüklenirken bir hata oluştu." }, { status: 500 });
  }
}