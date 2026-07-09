"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface IPhoto {
  _id: string;
  url: string;
}

export default function CustomerGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;

  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Müşteri bir fotoğrafa tıkladığında resmi büyük görmek isterse kullanacağımız durum
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Bu galeriye ait fotoğrafları arka plandan çekiyoruz
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos?galleryId=${galleryId}`);
        const resData = await response.json();
        if (resData.success) {
          setPhotos(resData.data);
        }
      } catch (error) {
        console.error("Fotoğraflar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [galleryId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">
      
      {/* Üst Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Albümlere Geri Dön
          </Link>
          <h1 className="text-base font-light tracking-widest uppercase">
            Anı <span className="font-bold">Galerisi</span>
          </h1>
          <div className="w-20"></div> {/* Dengeli durması için boşluk */}
        </div>
      </header>

      {/* Ana Galeri Alanı */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        
        {loading ? (
          <div className="text-center py-24 text-zinc-400 text-sm animate-pulse">
            Fotoğraflarınız yüksek kalitede yükleniyor...
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 max-w-md mx-auto">
            <p className="text-lg font-medium mb-2">Bu albüm henüz hazır değil.</p>
            <p className="text-sm text-zinc-600">Fotoğraflar stüdyo tarafından yüklendiğinde burada görünecektir.</p>
          </div>
        ) : (
          /* Müşteriye özel, kırpılmayan şık fotoğraf duvarı */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo) => (
              <div 
                key={photo._id} 
                onClick={() => setSelectedImage(photo.url)}
                className="break-inside-avoid overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 hover:ring-zinc-400 cursor-zoom-in group relative"
              >
                <img 
                  src={photo.url} 
                  alt="Düğün Hikayesi"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BÜYÜK RESİM GÖSTERME MODALI (LIGHTBOX) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-zinc-400 hover:text-white text-2xl font-light"
            onClick={() => setSelectedImage(null)}
          >
            ✕ Kapat
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-md shadow-2xl">
            <img 
              src={selectedImage} 
              alt="Büyük Görünüm" 
              className="max-w-full max-h-[85vh] object-contain select-none"
            />
          </div>
        </div>
      )}

      <footer className="py-12 text-center text-xs text-zinc-600 border-t border-zinc-900 mt-24">
        <p>Fotoğrafları büyütmek için üzerlerine tıklayabilirsiniz.</p>
      </footer>

    </div>
  );
}