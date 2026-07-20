import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo";
import { requireAdmin } from "@/lib/admin";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

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
          
          if (payload.password === gallery.password) {
            isAuthorized = true;
          } else {
            isAuthorized = false;
          }
        } catch (err) {
          console.error("JWT doğrulama hatası:", err); // 'err' uyarısını çözen satır
          isAuthorized = false; 
        }
      }
    }

    gallery.photoCount = await Photo.countDocuments({ galleryId: id });

    return NextResponse.json({ success: true, data: gallery, isAuthorized });
  } catch (error) {
    console.error("Gallery Info GET hatası:", error); // Uyarıyı çözen satır
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

    if (body.password !== undefined) {
       updateData.password = body.password;
    }

    if (body.isSelectionCompleted !== undefined) updateData.isSelectionCompleted = body.isSelectionCompleted;
    if (body.isNotificationRead !== undefined) updateData.isNotificationRead = body.isNotificationRead;

    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, { new: true }).lean();
    return NextResponse.json({ success: true, data: updatedGallery });
  } catch (error) {
    console.error("Gallery Info PUT hatası:", error); // Uyarıyı çözen satır
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await connectToDatabase();
    await Photo.deleteMany({ galleryId: id });
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Galeri başarıyla silindi." });
  } catch (error) {
    console.error("Gallery Info DELETE hatası:", error);
    return NextResponse.json({ error: "Silme işlemi başarısız oldu." }, { status: 500 });
  }
}