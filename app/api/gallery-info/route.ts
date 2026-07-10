import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo"; // Galeriyi silerken içindeki fotoğrafları da silmek için ekledik

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID eksik" }, { status: 400 });
    
    await connectToDatabase();
    const gallery = await Gallery.findById(id);
    if (!gallery) return NextResponse.json({ error: "Galeri bulunamadı" }, { status: 404 });
    
    const galleryObj = gallery.toObject();
    galleryObj.eventDate = galleryObj.date;

    return NextResponse.json({ success: true, data: galleryObj });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) return NextResponse.json({ error: "ID eksik" }, { status: 400 });

    await connectToDatabase();
    
    // YENİ EKLENEN KISIM: Şifre, Aktiflik ve Kapak Fotoğrafı da artık güncelleniyor
    const updatedGallery = await Gallery.findByIdAndUpdate(
      id, 
      {
        title: body.title,
        coupleName: body.coupleName,
        date: body.eventDate, 
        description: body.description,
        password: body.password !== undefined ? body.password : "", 
        isActive: body.isActive !== undefined ? body.isActive : true,
        coverImage: body.coverImage
      }, 
      { new: true }
    );
    
    return NextResponse.json({ success: true, data: updatedGallery });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// YENİ EKLENEN KISIM: Galeriyi tamamen silme işlemi
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID eksik" }, { status: 400 });

    await connectToDatabase();
    
    // 1. Önce bu galeriye ait tüm fotoğrafları veritabanından sil
    await Photo.deleteMany({ galleryId: id });
    
    // 2. Sonra galerinin kendisini sil
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Galeri başarıyla silindi." });
  } catch (error) {
    return NextResponse.json({ error: "Silme işlemi başarısız oldu." }, { status: 500 });
  }
}