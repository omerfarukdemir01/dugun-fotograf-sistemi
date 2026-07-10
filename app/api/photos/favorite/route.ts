
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";

// Favori durumunu güncelleme (PATCH) isteği
export async function PATCH(request: Request) {
  try {
    const { photoId, isFavorite } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: "Fotoğraf ID eksik." }, { status: 400 });
    }

    await connectToDatabase();

    // Fotoğrafı bul ve isFavorite durumunu müşteriden gelen yeni durumla güncelle
    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      { isFavorite: isFavorite },
      { new: true } // Güncellenmiş halini geri dönmesi için
    );

    if (!updatedPhoto) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPhoto });

  } catch (error) {
    console.error("Favori Güncelleme Hatası:", error);
    return NextResponse.json({ error: "İşlem sırasında hata oluştu." }, { status: 500 });
  }
}