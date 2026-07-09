export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      {/* Üst Menü (Navbar) - Sayfayı kaydırsan bile üstte yapışık (sticky) kalır */}
      <header className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-light tracking-wide text-zinc-900">
            Studio<span className="font-bold">Panel</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600">Hoş geldin, Admin</span>
            <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Başlık ve Yeni Galeri Ekleme Butonu */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Galeriler</h2>
          <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800">
            + Yeni Galeri Oluştur
          </button>
        </div>

        {/* Galeri Kartları (İleride müşterilere gönderilecek kısımlar) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Örnek Bir Galeri Kartı */}
          <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md">
            
            {/* Kart Görsel Alanı (İleride buraya düğün kapak fotoğrafı gelecek) */}
            <div className="relative aspect-video w-full bg-zinc-100">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                Kapak Fotoğrafı
              </div>
            </div>
            
            {/* Kart İçeriği ve Bilgiler */}
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">Ahmet & Ayşe</h3>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Aktif
                </span>
              </div>
              <p className="mb-4 text-sm text-zinc-500">15 Ağustos 2026 • 120 Fotoğraf</p>
              
              {/* İşlem Butonları */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200">
                  Düzenle
                </button>
                <button className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
                  Fotoğraf Yükle
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}