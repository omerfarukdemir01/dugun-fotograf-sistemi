import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { folder, galleryId } = body;

    // 1. Eksik Veri Kontrolü
    if (!folder || !galleryId) {
      return NextResponse.json({ error: "Klasör veya Galeri ID eksik gönderildi." }, { status: 400 });
    }

    // 2. Madde 3: MongoDB ObjectId Doğrulaması
    if (!mongoose.Types.ObjectId.isValid(galleryId)) {
      return NextResponse.json({ error: "Geçersiz Galeri ID formatı." }, { status: 400 });
    }

    // 3. Veritabanında Galeri Var Mı Kontrolü
    await connectToDatabase();
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return NextResponse.json({ error: "Galeri veritabanında bulunamadı." }, { status: 404 });
    }

    // İmza için zaman damgası şart
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Gizli anahtarımızla imzayı oluşturuyoruz
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error("İmza Sunucu Hatası:", error);
    return NextResponse.json({ error: "Sunucu imza oluşturamadı." }, { status: 500 });
  }
}