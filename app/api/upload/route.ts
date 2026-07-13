import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery";

// Cloudinary Yapılandırması (.env.local dosyasındaki bilgileri kullanır)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const galleryId = formData.get("galleryId") as string; 

    if (!file || !galleryId) {
      return NextResponse.json({ error: "Dosya veya Galeri ID eksik." }, { status: 400 });
    }

    // 1. Dosyayı hafızaya (Buffer) alıyoruz
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Buffer'ı doğrudan Cloudinary'ye yüklüyoruz (Stream)
    // Bu işlem asenkron olduğu için bir Promise içine alıyoruz
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `studio-omer/galeri_${galleryId}`, // Cloudinary'de her galeri için ayrı klasör oluşturur!
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Veriyi Cloudinary'ye gönder
      uploadStream.end(buffer);
    });

    // Cloudinary'nin bize verdiği güvenli ve kalıcı link
    const fileUrl = uploadResult.secure_url;

    // 3. VERİTABANI İŞLEMLERİ
    await connectToDatabase();

    // Fotoğrafın Cloudinary linkini veritabanına kaydet
    await Photo.create({
      galleryId: galleryId,
      url: fileUrl,
    });

    // Galerinin içindeki "photoCount" (Fotoğraf Sayısı) değerini 1 artır
    await Gallery.findByIdAndUpdate(galleryId, { 
      $inc: { photoCount: 1 } 
    });

    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error("Yükleme Hatası:", error);
    return NextResponse.json({ error: "Dosya buluta kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}