import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo";
import { z } from "zod";

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

    const newGallery = await Gallery.create({
      title,
      eventDate: date,
      password: password || "", // Bcrypt sildik, şifreyi düz kaydediyoruz
    });

    return NextResponse.json({ success: true, data: newGallery }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Veritabanına kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    // select("-password") SİLİNDİ! Artık admin panelinde şifreler görünecek.
    const galleries = await Gallery.find({}).sort({ createdAt: -1 }).lean();

    const galleriesWithRealCounts = await Promise.all(
      galleries.map(async (gallery) => {
        const actualPhotoCount = await Photo.countDocuments({ galleryId: gallery._id });
        return { ...gallery, photoCount: actualPhotoCount };
      })
    );

    return NextResponse.json({ success: true, data: galleriesWithRealCounts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Galeriler yüklenirken bir hata oluştu." }, { status: 500 });
  }
}