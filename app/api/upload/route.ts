import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/admin";

const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB sınırı

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { galleryId, secure_url, public_id, originalName, width, height, bytes, format } = body;

    if (!galleryId || !secure_url || !public_id) {
      return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
    }

    // 1. Gerçek MIME/Format Doğrulaması
    if (!format || !ALLOWED_FORMATS.includes(format.toLowerCase())) {
      return NextResponse.json({ 
        error: `Geçersiz dosya türü tespit edildi (${format}). Sadece JPG, PNG ve WEBP yüklenebilir.` 
      }, { status: 400 });
    }

    // 2. Maksimum Dosya Boyutu Kontrolü
    if (bytes > MAX_FILE_SIZE) {
      const mbSize = (bytes / 1024 / 1024).toFixed(2);
      return NextResponse.json({ 
        error: `Dosya boyutu çok büyük (${mbSize} MB). Maksimum 25 MB izin veriliyor.` 
      }, { status: 400 });
    }

    await connectToDatabase();

    // ÇÖZÜM: Transaction (session) kaldırıldı. Paralel (aynı anda 3'lü) yüklemelerde 
    // WriteConflict (çakışma) almamak için işlemleri doğrudan yapıyoruz.
    
    // 1. Fotoğrafı veritabanına kaydet
    await Photo.create({
      galleryId,
      url: secure_url,
      publicId: public_id,
      originalName,
      width,
      height,
      bytes,
      format,
    });

    // 2. Sayacı atomik olarak artır (MongoDB $inc işlemi kendi içinde güvenlidir)
    await Gallery.findByIdAndUpdate(
      galleryId, 
      { $inc: { photoCount: 1 } }
    );

    return NextResponse.json({ success: true, url: secure_url });

  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }
    console.error("DB Kayıt Hatası:", error);
    return NextResponse.json({ error: "Veritabanı kaydı başarısız." }, { status: 500 });
  }
}