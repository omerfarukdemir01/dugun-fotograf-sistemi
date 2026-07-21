import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/admin";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: Fotoğrafları pagination (sayfalama) ile getir (Madde 7 Performans kriteri)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    if (!galleryId) {
      return NextResponse.json({ error: "Galeri ID eksik." }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(galleryId)) {
      return NextResponse.json({ error: "Geçersiz galeri ID." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Önce Galeriyi bul
    const gallery = await Gallery.findById(galleryId).lean();
    if (!gallery) {
      return NextResponse.json({ error: "Galeri bulunamadı." }, { status: 404 });
    }

    // 2. Admin mi diye sessizce kontrol et
    let isAdmin = false;
    try {
      await requireAdmin();
      isAdmin = true;
    } catch {
      isAdmin = false;
    }

    // 3. API KİLİDİ: Galeri pasifse ve istek atan kişi Admin DEĞİLSE 403 Forbidden dön!
    if (!gallery.isActive && !isAdmin) {
      return NextResponse.json({ 
        error: "Bu galeri erişime kapatılmıştır. Fotoğraflar görüntülenemez." 
      }, { status: 403 });
    }

    const total = await Photo.countDocuments({ galleryId });

    // .lean() kullanarak performansı uçuruyoruz (Madde 7)
    const photos = await Photo.find({ galleryId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: photos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// DELETE: Hem DB'den hem de Cloudinary'den tekli/toplu silme motoru (Madde 5)
export async function DELETE(request: Request) {
  try {
    // Önce admin yetkisini kontrol et
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // Tekli silme için gelen id

    await connectToDatabase();

    if (id) {
      // 1. TEKLİ SİLME İŞLEMİ
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Geçersiz Fotoğraf ID." }, { status: 400 });
      }

      const photo = await Photo.findById(id);
      if (!photo) {
        return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
      }

      // Önce Cloudinary'den sil (Eğer publicId varsa)
      if (photo.publicId) {
        const cloudinaryResult = await cloudinary.uploader.destroy(photo.publicId);
        if (cloudinaryResult.result !== "ok" && cloudinaryResult.result !== "not_found") {
          return NextResponse.json({ error: "Cloudinary silme işlemi başarısız oldu." }, { status: 500 });
        }
      }

      // Sonra veritabanından sil ve galeri sayacını düşür
      await Photo.findByIdAndDelete(id);
      await Gallery.findByIdAndUpdate(photo.galleryId, {
        $inc: { photoCount: -1 }
      });

      return NextResponse.json({ success: true });
    } else {
      // 2. TOPLU SİLME İŞLEMİ (Bulk Delete)
      // Frontend eğer body içinde ids gönderirse toplu sileriz
      const body = await request.json().catch(() => ({}));
      const { ids } = body as { ids: string[] };

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "Silinecek fotoğrafların ID listesi eksik." }, { status: 400 });
      }

      // Geçerli ID'leri bul ve dökümanları getir
      const photosToBulkDelete = await Photo.find({ _id: { $in: ids } });
      if (photosToBulkDelete.length === 0) {
        return NextResponse.json({ error: "Silinecek fotoğraf bulunamadı." }, { status: 404 });
      }

      const publicIds = photosToBulkDelete.map(p => p.publicId).filter(Boolean);
      const galleryIdFromPhoto = photosToBulkDelete[0].galleryId;

      // Cloudinary'den toplu sil (Bulk Delete API)
      if (publicIds.length > 0) {
        const cloudinaryBulkResult = await cloudinary.api.delete_resources(publicIds);
        // Cloudinary sonuç kontrolü
        if (!cloudinaryBulkResult.deleted) {
          return NextResponse.json({ error: "Cloudinary toplu silme başarısız." }, { status: 500 });
        }
      }

      // Veritabanından toplu sil
      await Photo.deleteMany({ _id: { $in: ids } });

      // Galerideki fotoğraf sayısını silinen adet kadar azalt
      await Gallery.findByIdAndUpdate(galleryIdFromPhoto, {
        $inc: { photoCount: -photosToBulkDelete.length }
      });

      return NextResponse.json({ success: true, deletedCount: photosToBulkDelete.length });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }
    console.error("Silme Hatası:", error);
    return NextResponse.json({ error: "Silme işlemi sırasında bir hata oluştu." }, { status: 500 });
  }
}