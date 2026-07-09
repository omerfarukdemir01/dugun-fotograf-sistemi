import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const galleryId = formData.get("galleryId") as string; // Frontend'den gelen Galeri ID'si

    if (!file || !galleryId) {
      return NextResponse.json({ error: "Dosya veya Galeri ID eksik." }, { status: 400 });
    }

    // 1. Dosyayı diske kaydetme işlemleri
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(process.cwd(), "public", "uploads", uniqueName);
    
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // 2. VERİTABANI İŞLEMLERİ (YENİ EKLENEN KISIM)
    await connectToDatabase();

    // Fotoğrafı veritabanına kaydet
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
    return NextResponse.json({ error: "Dosya kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}