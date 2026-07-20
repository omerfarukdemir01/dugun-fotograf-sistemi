import AdminClient from "./AdminClient";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Photo from "@/models/Photo";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // 1. Yetki kontrolünü sunucuda (backend) ışık hızında yapıyoruz
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  // 2. Verileri doğrudan veritabanından çekiyoruz (API'ye istek atmadan)
  await connectToDatabase();
  const galleries = await Gallery.find({}).sort({ createdAt: -1 }).lean();

  const initialGalleries = await Promise.all(
    galleries.map(async (gallery) => {
      // Fotoğraf sayısını güvenli bir şekilde hesapla
      const photoCount = await Photo.countDocuments({ galleryId: gallery._id });
      
      return {
        _id: gallery._id.toString(),
        title: gallery.title,
        // Tarih objesini string'e çeviriyoruz ki client'a aktarılırken hata vermesin
        date: gallery.eventDate ? new Date(gallery.eventDate).toISOString().split('T')[0] : "",
        photoCount,
        description: gallery.description || "",
        coverImage: gallery.coverImage || "",
        isSelectionCompleted: !!gallery.isSelectionCompleted,
        isNotificationRead: !!gallery.isNotificationRead,
      };
    })
  );

  // 3. Veriyi Client bileşenine hazır paket halinde yolluyoruz
  return <AdminClient initialGalleries={initialGalleries} />;
}