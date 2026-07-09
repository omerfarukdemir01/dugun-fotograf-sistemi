"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Next.js'in optimize edilmiş resim bileşeni

interface IPhoto {
  _id: string;
  url: string;
  createdAt: string;
}

export default function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;
  
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Bu galeriye ait fotoğrafları veritabanından çeken fonksiyon
  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/photos?galleryId=${galleryId}`);
      const resData = await response.json();
      if (resData.success) {
        setPhotos(resData.data);
      }
    } catch (error) {
      console.error("Fotoğraflar getirilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde fotoğrafları getir
  useEffect(() => {
    fetchPhotos();
  }, [galleryId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("galleryId", galleryId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (resData.success) {
        // Yükleme başarılı olunca listeyi hemen yenile
        fetchPhotos(); 
      } else {
        alert("Hata: " + resData.error);
      }
    } catch (error) {
      console.error("Yükleme sırasında hata:", error);
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              ← Geri Dön
            </Link>
            <h1 className="text-xl font-medium text-zinc-900">
              Galeri Yönetimi
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Fotoğraf Yükleme Alanı</h2>
          <p className="text-zinc-500 mb-6">Şu an işlem yapılan galeri ID: <span className="font-mono text-xs bg-zinc-100 p-1 rounded">{galleryId}</span></p>
          
          <div className="relative border-2 border-dashed border-zinc-300 rounded-xl p-12 text-center hover:bg-zinc-50 transition-colors cursor-pointer mb-12">
            <input 
              type="file" 
              accept="image/jpeg, image/png"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="text-zinc-500">
              {isUploading ? (
                <span className="font-semibold text-zinc-900">Fotoğraf Yükleniyor... Lütfen bekleyin.</span>
              ) : (
                <>
                  <span className="font-semibold text-zinc-900">Yüklenecek fotoğrafı seçin</span> veya kutuya tıklayın
                </>
              )}
            </div>
          </div>

          {/* EKLENEN KISIM: FOTOĞRAF GALERİSİ */}
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Yüklenen Fotoğraflar ({photos.length})</h3>
          
          {loading ? (
            <div className="text-sm text-zinc-500">Fotoğraflar yükleniyor...</div>
          ) : photos.length === 0 ? (
            <div className="text-sm text-zinc-500 bg-zinc-50 p-6 rounded-lg text-center border border-zinc-200">
              Bu galeriye henüz fotoğraf yüklenmemiş.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <div key={photo._id} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                  <Image 
                    src={photo.url} 
                    alt="Düğün Fotoğrafı"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  {/* Fotoğraf silme butonu eklenebilir (Şimdilik görsel) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-red-500 text-white p-1.5 rounded-md text-xs hover:bg-red-600">
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}