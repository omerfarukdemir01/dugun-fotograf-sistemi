import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery"; // Galerinin kilitli olup olmadığını kontrol etmek için eklendi
import mongoose from "mongoose";

// Favori durumunu güncelleme (PATCH) isteği
export async function PATCH(request: Request) {
  try {
    const { photoId, isFavorite } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: "Fotoğraf ID eksik." }, { status: 400 });
    }

    // Madde 3: Photo ID geçerli bir MongoDB ObjectId mi kontrol et
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: "Geçersiz Fotoğraf ID." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Önce fotoğrafı bul ki hangi galeriye ait olduğunu bilelim
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    // 2. Madde 2: Galeri kilitli mi diye kontrol et!
    const gallery = await Gallery.findById(photo.galleryId).lean();
    if (!gallery) {
      return NextResponse.json({ error: "Bağlı galeri bulunamadı." }, { status: 404 });
    }

    if (gallery.isSelectionCompleted) {
      return NextResponse.json({ 
        error: "Bu galeri için seçimler tamamlanmış ve kilitlenmiştir. Değişiklik yapılamaz." 
      }, { status: 403 });
    }

    // 3. Her şey güvenliyse fotoğrafın favori durumunu güncelle
    photo.isFavorite = isFavorite;
    await photo.save();

    return NextResponse.json({ success: true, data: photo });

  } catch (error) {
    console.error("Favori Güncelleme Hatası:", error);
    return NextResponse.json({ error: "İşlem sırasında hata oluştu." }, { status: 500 });
  }
}