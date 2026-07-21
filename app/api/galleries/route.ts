import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo";
import { z } from "zod";
import bcrypt from "bcryptjs";

const GalleryCreateSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur."),
  date: z.string().min(1, "Tarih zorunludur."),
  password: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const validation = GalleryCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Geçersiz veri formatı." }, { status: 400 });
    }

    const { title, date, password } = validation.data;
    await connectToDatabase();

    // Şifre varsa bcrypt ile hash'le, yoksa boş string birak
    let hashedPassword = "";
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newGallery = await Gallery.create({
      title,
      eventDate: date,
      password: hashedPassword,
    });

    // Yanıtta şifreyi dışarı sızdırmıyoruz
    const galleryData = newGallery.toObject();
    delete galleryData.password;

    return NextResponse.json({ success: true, data: galleryData }, { status: 201 });
  } catch (error) {
    console.error("Gallery POST hatası:", error);
    return NextResponse.json({ error: "Veritabanına kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Şifre alanını çekmiyoruz (-password)
    const galleries = await Gallery.find({}).select("-password").sort({ createdAt: -1 }).lean();

    const galleriesWithRealCounts = await Promise.all(
      galleries.map(async (gallery) => {
        const actualPhotoCount = await Photo.countDocuments({ galleryId: gallery._id });
        return { ...gallery, photoCount: actualPhotoCount };
      })
    );

    return NextResponse.json({ success: true, data: galleriesWithRealCounts }, { status: 200 });
  } catch (error) {
    console.error("Gallery GET hatası:", error);
    return NextResponse.json({ error: "Galeriler yüklenirken bir hata oluştu." }, { status: 500 });
  }
}