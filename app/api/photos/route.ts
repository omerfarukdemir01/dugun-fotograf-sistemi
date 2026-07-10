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
import { unlink } from "fs/promises";
import path from "path";
import Gallery from "@/models/Gallery";

// ... (Burada daha önce yazdığımız GET fonksiyonu duruyor olacak, ona dokunma)

// Fotoğraf silme (DELETE) işlemi
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Fotoğraf ID bulunamadı." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Silinecek fotoğrafı veritabanında bul
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    // 2. Fotoğrafı bilgisayarın diskinden (public/uploads) fiziksel olarak sil
    try {
      const filePath = path.join(process.cwd(), "public", photo.url);
      await unlink(filePath);
    } catch (err) {
      console.error("Dosya diskten silinemedi (Zaten silinmiş olabilir):", err);
    }

    // 3. Fotoğrafı veritabanından sil
    await Photo.findByIdAndDelete(photoId);

    // 4. Galerinin toplam fotoğraf sayısını 1 azalt
    await Gallery.findByIdAndUpdate(photo.galleryId, {
      $inc: { photoCount: -1 }
    });

    return NextResponse.json({ success: true, message: "Fotoğraf başarıyla silindi." });

  } catch (error) {
    console.error("Silme Hatası:", error);
    return NextResponse.json({ error: "Fotoğraf silinirken bir hata oluştu." }, { status: 500 });
  }
}