import { Metadata } from "next";
import CustomerGalleryClient from "./CustomerGalleryClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const galleryId = resolvedParams.id;
  
  try {
    // Localhost veya Vercel URL'sini al
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // FETCH YAPARKEN DİKKAT: Header ekleyerek sadece JSON beklediğimizi belirtelim
    const response = await fetch(`${baseUrl}/api/gallery-info?id=${galleryId}`, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json'
      }
    });

    // Eğer yanıt başarılı değilse boş geç
    if (!response.ok) return { title: "Studio Ömer" };

    const resData = await response.json();
    
    if (resData.success && resData.data) {
      const gallery = resData.data;
      return {
        title: `${gallery.title} | Studio Ömer`,
        description: gallery.description || "Özel Koleksiyon",
        openGraph: {
          title: gallery.title,
          images: gallery.coverImage ? [gallery.coverImage] : [],
        },
      };
    }
  } catch (error) {
    // Burada hata yakalarsak sessiz kal, meta verisiz devam et
    return { title: "Studio Ömer" };
  }

  return { title: "Studio Ömer" };
}

export default async function CustomerGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CustomerGalleryClient galleryId={resolvedParams.id} />;
}