"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

interface IPhoto {
  _id: string;
  url: string;
  isFavorite: boolean;
}

export default function CustomerGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;

  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  
  const selectedPhoto = photos.find(p => p._id === selectedPhotoId);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos?galleryId=${galleryId}&t=${Date.now()}`, {
          cache: "no-store"
        });
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

  const handleToggleFavorite = async (e: React.MouseEvent, photoId: string, currentStatus: boolean) => {
    e.stopPropagation(); 
    const newStatus = !currentStatus;

    setPhotos(photos.map(photo => 
      photo._id === photoId ? { ...photo, isFavorite: newStatus } : photo
    ));

    try {
      const response = await fetch("/api/photos/favorite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isFavorite: newStatus })
      });
      
      const resData = await response.json();
      if (!resData.success) {
        setPhotos(photos.map(photo => 
          photo._id === photoId ? { ...photo, isFavorite: currentStatus } : photo
        ));
      }
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
      setPhotos(photos.map(photo => 
        photo._id === photoId ? { ...photo, isFavorite: currentStatus } : photo
      ));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Albümlere Geri Dön
          </Link>
          <h1 className="text-base font-light tracking-widest uppercase">
            Anı <span className="font-bold">Galerisi</span>
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

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
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo) => (
              <div 
                key={photo._id} 
                onClick={() => setSelectedPhotoId(photo._id)}
                className="break-inside-avoid overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 hover:ring-zinc-400 cursor-zoom-in group relative"
              >
                <img 
                  src={photo.url} 
                  alt="Düğün Hikayesi"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className={`absolute top-3 right-3 z-10 transition-opacity duration-200 ${photo.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    onClick={(e) => handleToggleFavorite(e, photo._id, !!photo.isFavorite)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-sm ${
                      photo.isFavorite 
                        ? 'bg-red-500 text-white scale-110' 
                        : 'bg-black/40 text-white hover:bg-black/60 hover:scale-110'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhotoId(null)}
        >
          <button 
            className="absolute top-6 right-6 text-zinc-400 hover:text-white text-2xl font-light z-50"
            onClick={() => setSelectedPhotoId(null)}
          >
            ✕ Kapat
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto.url} 
              alt="Büyük Görünüm" 
              className="max-w-full max-h-[85vh] object-contain select-none rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-6 py-3 backdrop-blur-md transition-all shadow-xl">
              <button
                onClick={(e) => handleToggleFavorite(e, selectedPhoto._id, !!selectedPhoto.isFavorite)}
                className={`flex items-center gap-2 transition-all font-medium tracking-wide ${
                  selectedPhoto.isFavorite ? 'text-red-500' : 'text-zinc-200 hover:text-red-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                {selectedPhoto.isFavorite ? 'Favorilerde' : 'Favoriye Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}