"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface IGallery {
  _id: string;
  title: string;
  date: string;
  photoCount: number;
  description?: string;
  coverImage?: string; 
  isSelectionCompleted?: boolean;
  isNotificationRead?: boolean;
}

export default function AdminPage() {
  const router = useRouter(); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  
  const [galleries, setGalleries] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGalleries = useCallback(async () => {
    try {
      const response = await fetch(`/api/galleries?t=${Date.now()}`, {
        cache: "no-store"
      });
      const resData = await response.json();
      if (resData.success) {
        setGalleries(resData.data);
      }
    } catch (error) {
      console.error("Galeriler getirilirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date }),
      });

      const resData = await response.json();

      if (resData.success) {
        setIsOpen(false);
        setTitle("");
        setDate("");
        fetchGalleries(); 
      } else {
        alert("Bir hata oluştu: " + resData.error);
      }
    } catch (error) {
      console.error("İstek gönderilirken hata oluştu:", error);
    }
  };

  const unreadNotifications = galleries.filter(g => g.isSelectionCompleted && !g.isNotificationRead);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      <header className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-light tracking-wide text-zinc-900">
            Studio<span className="font-bold">Panel</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600">Hoş geldin, Admin</span>
            
            <button 
  onClick={async () => {
    // Buraya { method: 'POST' } eklendi
    await fetch('/api/logout', { method: 'POST' }); 
    router.push('/login');
    router.refresh();
  }}
  className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
>
  Çıkış Yap
</button>
            
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Galeriler</h2>
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800"
          >
            + Yeni Galeri Oluştur
          </button>
        </div>

        {unreadNotifications.length > 0 && (
          <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
              <h2 className="text-xl font-bold text-blue-900">Yeni Tamamlanan Seçimler</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unreadNotifications.map(gallery => (
                <Link 
                  key={gallery._id} 
                  href={`/admin/gallery/${gallery._id}`} 
                  className="block bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{gallery.title}</h3>
                      <p className="text-sm text-zinc-500">Müşteri seçimini tamamladı!</p>
                    </div>
                    <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Galeriler yükleniyor...</div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl p-8 bg-white">
            <p className="text-zinc-500 text-sm">Henüz hiç galeri oluşturulmamış.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <div key={gallery._id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md relative">
                
                {gallery.isSelectionCompleted && (
                  <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-md">
                    Seçim Tamamlandı
                  </div>
                )}

                <div className="relative aspect-[4/3] w-full bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden">
                  {gallery.coverImage ? (
                    <img 
                      src={gallery.coverImage} 
                      alt={gallery.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm">Kapak Fotoğrafı Yok</span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900 leading-tight">{gallery.title}</h3>
                  </div>
                  <p className="mb-3 text-xs text-zinc-500 font-medium">{gallery.date} • {gallery.photoCount} Fotoğraf</p>
                  
                  {gallery.description && (
                    <p className="mb-4 text-sm text-zinc-600 line-clamp-2 border-l-2 border-zinc-200 pl-2">
                      {gallery.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex gap-2">
                    <Link 
                      href={`/admin/gallery/${gallery._id}`}
                      className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                      Yönet
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-zinc-200">
            <h3 className="text-xl font-semibold text-zinc-900 mb-4">Yeni Galeri Oluştur</h3>
            
            <form onSubmit={handleCreateGallery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">Galeri / Çift Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Ahmet & Ayşe Düğünü" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Etkinlik Tarihi</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                  İptal
                </button>
                <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Galeri Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}