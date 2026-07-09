"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. EKLENEN KISIM: Yönlendirme aracı

// Bir galerinin sahip olduğu veri yapısını TypeScript'e tanıtıyoruz
interface IGallery {
  _id: string;
  title: string;
  date: string;
  photoCount: number;
}

export default function AdminPage() {
  const router = useRouter(); // Yönlendiriciyi başlattık
  
  // 2. EKLENEN KISIM: Güvenlik Bekçisi
  // Sayfa açılır açılmaz tarayıcı hafızasına (localStorage) bakar
  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthenticated");
    if (auth !== "true") {
      // Eğer kilit anahtarı yoksa kapıdan içeri almaz, logine yollar
      router.push("/login");
    }
  }, [router]);

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  
  // Veritabanından gelecek olan galerileri tutacağımız durum
  const [galleries, setGalleries] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);

  // Sayfa ilk açıldığında veritabanındaki galerileri getiren fonksiyon
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

  // useEffect yardımıyla sayfa yüklenir yüklenmez yukarıdaki fonksiyonu tetikliyoruz
  useEffect(() => {
    fetchGalleries();
  }, []);

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
        alert("Harika! Galeri başarıyla MongoDB veritabanına kaydedildi.");
        setIsOpen(false);
        setTitle("");
        setDate("");
        fetchGalleries(); // Yeni galeri eklenince listeyi otomatik yenile
      } else {
        alert("Bir hata oluştu: " + resData.error);
      }
    } catch (error) {
      console.error("İstek gönderilirken hata oluştu:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      {/* Üst Menü */}
      <header className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-light tracking-wide text-zinc-900">
            Studio<span className="font-bold">Panel</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600">Hoş geldin, Admin</span>
            
            {/* 3. EKLENEN KISIM: Çıkış Yap butonu aktif edildi */}
            <button 
              onClick={() => {
                localStorage.removeItem("isAdminAuthenticated");
                router.push("/login");
              }}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
            >
              Çıkış Yap
            </button>
            
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
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

        {/* Yükleniyor Durumu */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Galeriler yükleniyor...</div>
        ) : galleries.length === 0 ? (
          /* Eğer henüz hiç galeri yoksa gösterilecek alan */
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl p-8 bg-white">
            <p className="text-zinc-500 text-sm">Henüz hiç galeri oluşturulmamış.</p>
          </div>
        ) : (
          /* Veritabanındaki galerileri dönerek kartları ekrana basıyoruz */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <div key={gallery._id} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md">
                <div className="relative aspect-video w-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  Kapak Fotoğrafı
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">{gallery.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Aktif
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-zinc-500">{gallery.date} • {gallery.photoCount} Fotoğraf</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200">
                      Düzenle
                    </button>
                    <Link 
                      href={`/admin/gallery/${gallery._id}`}
                      className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                      Fotoğraf Yükle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* POP-UP FORM ALANI */}
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