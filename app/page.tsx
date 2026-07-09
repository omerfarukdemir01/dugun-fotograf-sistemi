"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface IGallery {
  _id: string;
  title: string;
  date: string;
  photoCount: number;
}

export default function HomePage() {
  const [galleries, setGalleries] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);

  // Veritabanından galerileri çekiyoruz (Tıpkı admin panelinde yaptığımız gibi)
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await fetch("/api/galleries");
        const resData = await response.json();
        if (resData.success) {
          setGalleries(resData.data);
        }
      } catch (error) {
        console.error("Galeriler getirilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      
      {/* Şık Bir Karşılama Alanı (Hero Section) */}
      <header className="bg-zinc-50 py-20 text-center border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl mb-4">
            En Mutlu <span className="font-semibold">Anlarınız...</span>
          </h1>
          <p className="text-lg text-zinc-500">
            Düğün, nişan ve özel günlerinize ait fotoğraflara dijital galerinizden güvenle ulaşın.
          </p>
        </div>
      </header>

      {/* Galeriler Listesi */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-medium text-zinc-900 mb-8 text-center">Dijital Albümler</h2>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Albümler yükleniyor...</div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            Henüz yayında olan bir albüm bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleries.map((gallery) => (
              /* Müşteriyi kendi galerisine yönlendirecek olan Link */
              <Link 
                href={`/gallery/${gallery._id}`} 
                key={gallery._id}
                className="group block overflow-hidden rounded-2xl bg-zinc-50 transition-all hover:bg-zinc-100 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-200 flex items-center justify-center text-zinc-400">
                  <span className="text-sm">Kapak Gelecek</span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1 group-hover:text-zinc-700">
                    {gallery.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {gallery.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="py-8 text-center text-sm text-zinc-400 border-t border-zinc-100 mt-12">
        <p>© 2026 Studio. Tüm hakları saklıdır.</p>
      </footer>
      
    </div>
  );
}