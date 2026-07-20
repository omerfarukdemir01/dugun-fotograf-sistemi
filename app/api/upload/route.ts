import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/admin";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { galleryId, secure_url, public_id, originalName, width, height, bytes, format } = body;

    if (!galleryId || !secure_url || !public_id) {
      return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
    }

    await connectToDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fotoğraf kaydını transaction (güvenli işlem) içinde yapıyoruz
      await Photo.create([{
        galleryId,
        url: secure_url,
        publicId: public_id,
        originalName,
        width,
        height,
        bytes,
        format,
      }], { session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    // 2. ÇAKIŞMA ÇÖZÜMÜ: Sayaç güncellemesini transaction ({ session }) DIŞINDA yapıyoruz.
    await Gallery.findByIdAndUpdate(galleryId, {
      $inc: { photoCount: 1 },
    });

    return NextResponse.json({ success: true, url: secure_url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }
    console.error("DB Kayıt Hatası:", error);
    return NextResponse.json({ error: "Veritabanı kaydı başarısız." }, { status: 500 });
  }
}