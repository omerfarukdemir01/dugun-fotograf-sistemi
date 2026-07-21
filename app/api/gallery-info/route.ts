 import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo";
import { requireAdmin } from "@/lib/admin";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    const gallery = await Gallery.findById(id).lean();
    if (!gallery) return NextResponse.json({ error: "Galeri bulunamadı" }, { status: 404 });

    let isAuthorized = false;

    if (!gallery.password) {
      isAuthorized = true; 
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get(`gallery_auth_${id}`)?.value;

      if (token) {
        try {
          const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "omer_studio_secret");
          const { payload } = await jwtVerify(token, secret);
          
          // ÇÖZÜM: Token'daki hashKey ile veritabanındaki güncel şifre hash'i aynı mı diye bakıyoruz!
          // Eğer admin şifreyi değiştirmişse bunlar uyuşmaz ve isAuthorized otomatik 'false' olur.
          if (payload.galleryId === id && payload.isAuthorized && payload.hashKey === gallery.password) {
            isAuthorized = true;
          } else {
            isAuthorized = false;
          }
        } catch {
          isAuthorized = false; 
        }
      }
    }

    const photoCount = await Photo.countDocuments({ galleryId: id });
    const responseGallery = { ...gallery, photoCount };

    if (gallery.password) {
      responseGallery.password = "********"; 
    } else {
      responseGallery.password = "";
    }

    return NextResponse.json({ success: true, data: responseGallery, isAuthorized });
  } catch (error) {
    console.error("Gallery Info GET hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    const updateData: Record<string, unknown> = {
      title: body.title,
      coupleName: body.coupleName,
      description: body.description,
      isActive: body.isActive !== undefined ? body.isActive : true,
      coverImage: body.coverImage
    };

    if (body.eventDate) updateData.eventDate = new Date(body.eventDate);

    // ÇÖZÜMÜN 2. KISMI: Arayüzden gelen duruma göre akıllı şifre yönetimi
    if (body.password !== undefined) {
      if (body.password === "********") {
        // Kullanıcı şifreyi değiştirmemiş, veritabanındaki hash'e dokunmuyoruz!
      } else if (body.password === "") {
        // Kullanıcı inputu tamamen silmiş, şifreyi kaldır
        updateData.password = ""; 
      } else {
        // Kullanıcı yeni bir şifre yazmış, hash'leyip kaydediyoruz
        updateData.password = await bcrypt.hash(body.password, 10);
      }
    }

    if (body.isSelectionCompleted !== undefined) updateData.isSelectionCompleted = body.isSelectionCompleted;
    if (body.isNotificationRead !== undefined) updateData.isNotificationRead = body.isNotificationRead;

    // { new: true } yerine modern Mongoose standardı olan { returnDocument: "after" } kullanıyoruz
    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, { returnDocument: "after" })
      .select("-password")
      .lean();

    return NextResponse.json({ success: true, data: updatedGallery });

    return NextResponse.json({ success: true, data: updatedGallery });
  } catch (error) {
    console.error("Gallery Info PUT hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await connectToDatabase();
    await Photo.deleteMany({ galleryId: id });
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Galeri başarıyla silindi." });
  } catch (error) {
    console.error("Gallery Info DELETE hatası:", error);
    return NextResponse.json({ error: "Silme işlemi başarısız oldu." }, { status: 500 });
  }
}