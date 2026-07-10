"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IPhoto {
  _id: string;
  url: string;
  createdAt: string;
  isFavorite: boolean;
}

interface IGallery {
  title: string;
  coupleName: string;
  eventDate: string;
  description: string;
  password?: string; // YENİ
  isActive?: boolean; // YENİ
  coverImage?: string; // YENİ
}

export default function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [gallery, setGallery] = useState<IGallery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<IGallery>({ 
    title: "", coupleName: "", eventDate: "", description: "", password: "", isActive: true 
  });

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/photos?galleryId=${galleryId}&t=${Date.now()}`, { cache: "no-store" });
      const resData = await response.json();
      if (resData.success) setPhotos(resData.data);
    } catch (error) {
      console.error("Fotoğraflar hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryInfo = async () => {
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}&t=${Date.now()}`, { cache: "no-store" });
      const resData = await response.json();
      if (resData.success) {
        setGallery(resData.data);
        setEditForm({
          title: resData.data.title || "",
          coupleName: resData.data.coupleName || "",
          eventDate: resData.data.eventDate || "",
          description: resData.data.description || "",
          password: resData.data.password || "", // YENİ
          isActive: resData.data.isActive !== undefined ? resData.data.isActive : true // YENİ
        });
      }
    } catch (error) {
      console.error("Galeri bilgileri hata:", error);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchGalleryInfo();
  }, [galleryId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("galleryId", galleryId);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const resData = await response.json();
      if (resData.success) fetchPhotos(); 
      else alert("Hata: " + resData.error);
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`/api/photos?id=${photoId}`, { method: "DELETE" });
      const resData = await response.json();
      if (resData.success) fetchPhotos();
      else alert("Hata: " + resData.error);
    } catch (error) {
      alert("Sunucu bağlantı hatası.");
    }
  };

  // YENİ EKLENEN KISIM: Kapak Fotoğrafı Belirleme Fonksiyonu
  const handleSetCover = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gallery, coverImage: photoUrl }) // Mevcut bilgileri koru, sadece kapağı değiştir
      });
      const resData = await response.json();
      if (resData.success) {
        setGallery(resData.data);
        alert("Kapak fotoğrafı başarıyla ayarlandı!");
      } else {
        alert("Hata: " + resData.error);
      }
    } catch (error) {
      alert("Kapak ayarlanırken hata oluştu.");
    }
  };

  // YENİ EKLENEN KISIM: Galeriyi Tamamen Silme Fonksiyonu
  const handleDeleteGallery = async () => {
    // 1. Önce galerinin ismini öğreniyoruz
    const confirmName = window.prompt(
      `DİKKAT! Bu galeriyi kalıcı olarak silmek üzeresiniz.\n\n` +
      `İçindeki tüm fotoğraflar ve favori seçimleri silinecektir.\n\n` +
      `Onaylamak için lütfen galeri adını tam olarak yazın:\n"${gallery?.title}"`
    );

    // 2. Eğer kullanıcı ismi yanlış yazarsa veya iptal derse işlemi durdur
    if (confirmName !== gallery?.title) {
      if (confirmName !== null) {
        alert("Hata: Yazdığınız isim galeri adıyla eşleşmiyor. Silme işlemi iptal edildi.");
      }
      return;
    }

    // 3. İsim doğruysa silme işlemini başlat
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, { method: "DELETE" });
      const resData = await response.json();
      if (resData.success) {
        alert("Galeri başarıyla silindi.");
        router.push("/admin");
      } else {
        alert("Hata: " + resData.error);
      }
    } catch (error) {
      alert("Silme işlemi sırasında hata oluştu.");
    }
  };

  const handleUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Güncelleme yaparken coverImage kaybolmasın diye onu da ekliyoruz
      const dataToUpdate = { ...editForm, coverImage: gallery?.coverImage };
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToUpdate)
      });
      const resData = await response.json();
      if (resData.success) {
        setGallery(resData.data);
        setIsEditing(false); 
      } else {
        alert("Hata: " + resData.error);
      }
    } catch (error) {
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const favoriteCount = photos.filter(photo => photo.isFavorite).length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              ← Geri Dön
            </Link>
            <h1 className="text-xl font-medium text-zinc-900">
              {gallery ? gallery.title : "Yükleniyor..."}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-6 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-zinc-900">{gallery?.title}</h2>
                {/* YENİ: Aktif / Pasif Rozeti */}
                {gallery?.isActive ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Aktif</span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Pasif (Kapalı)</span>
                )}
                {/* YENİ: Şifre Rozeti */}
                {gallery?.password && (
                  <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    🔒 Şifreli
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mb-2">{gallery?.description}</p>
              <p className="text-zinc-400 text-xs font-mono bg-zinc-100 inline-block px-2 py-1 rounded">ID: {galleryId}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                ✏️ Düzenle
              </button>
              {/* YENİ: Galeriyi Sil Butonu */}
              <button
                onClick={handleDeleteGallery}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                🗑️ Sil
              </button>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm ring-1 ${
                  isCopied ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {isCopied ? <>✓ Kopyalandı!</> : <>🔗 Müşteri Linkini Kopyala</>}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Fotoğraf Yükle</h3>
          <div className="relative border-2 border-dashed border-zinc-300 rounded-xl p-10 text-center hover:bg-zinc-50 transition-colors cursor-pointer mb-12">
            <input 
              type="file" 
              accept="image/jpeg, image/png"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="text-zinc-500">
              {isUploading ? (
                <span className="font-semibold text-zinc-900">Fotoğraf Yükleniyor...</span>
              ) : (
                <><span className="font-semibold text-zinc-900">Yüklenecek fotoğrafı seçin</span> veya kutuya tıklayın</>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">
              Yüklenen Fotoğraflar ({photos.length})
            </h3>
            {favoriteCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                {favoriteCount} Müşteri Favorisi
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-sm text-zinc-500">Fotoğraflar yükleniyor...</div>
          ) : photos.length === 0 ? (
            <div className="text-sm text-zinc-500 bg-zinc-50 p-6 rounded-lg text-center border border-zinc-200">
              Bu galeriye henüz fotoğraf yüklenmemiş.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <div 
                  key={photo._id} 
                  onClick={() => setSelectedImage(photo.url)}
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 ring-1 cursor-zoom-in transition-all ${
                    photo.isFavorite ? 'ring-red-400 ring-2 shadow-md' : 'ring-zinc-200'
                  } ${gallery?.coverImage === photo.url ? 'ring-blue-500 ring-4' : ''}`} // Kapaksa mavi çerçeve yap
                >
                  <Image 
                    src={photo.url} 
                    alt="Düğün Fotoğrafı"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  
                  {/* Mevcut Kalp Rozeti */}
                  {photo.isFavorite && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-full shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" /></svg>
                    </div>
                  )}

                  {/* YENİ: Kapak fotoğrafı belirten yazı */}
                  {gallery?.coverImage === photo.url && (
                    <div className="absolute bottom-0 inset-x-0 bg-blue-500/90 text-white text-[10px] font-bold text-center py-1 z-10 uppercase tracking-widest">
                      Kapak
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                    {/* YENİ: Kapak Yap Butonu */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSetCover(photo.url); }}
                      className="bg-blue-500 text-white p-1.5 rounded-md text-xs hover:bg-blue-600 shadow-sm transition-colors"
                      title="Kapak Yap"
                    >
                      Kapak
                    </button>
                    {/* Sil Butonu */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo._id); }}
                      className="bg-red-500 text-white p-1.5 rounded-md text-xs hover:bg-red-600 shadow-sm transition-colors"
                      title="Sil"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* GALERİ DÜZENLEME MODALI */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-zinc-900">Galeriyi Düzenle</h3>
              <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
            </div>
            
            <form onSubmit={handleUpdateGallery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Galeri Adı</label>
                <input 
                  type="text" required
                  value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Tarih</label>
                <input 
                  type="date" required
                  value={editForm.eventDate} onChange={e => setEditForm({...editForm, eventDate: e.target.value})}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Açıklama</label>
                <textarea 
                  value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none h-20 resize-none"
                />
              </div>

              <div className="border-t border-zinc-100 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-zinc-900 mb-3">Güvenlik ve Erişim</h4>
                
                {/* YENİ: Şifre Belirleme Alanı */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Galeri Şifresi (İsteğe Bağlı)</label>
                  <input 
                    type="text"
                    placeholder="Şifresiz olması için boş bırakın"
                    value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none bg-zinc-50 font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Buraya şifre yazarsanız müşteri girmeden fotoğrafları göremez.</p>
                </div>

                {/* YENİ: Aktif / Pasif Seçeneği */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <input 
                    type="checkbox" 
                    id="isActiveToggle"
                    checked={editForm.isActive} 
                    onChange={e => setEditForm({...editForm, isActive: e.target.checked})}
                    className="w-4 h-4 text-black rounded focus:ring-black"
                  />
                  <label htmlFor="isActiveToggle" className="text-sm font-medium text-zinc-800 cursor-pointer select-none">
                    Galeri Erişime Açık (Aktif)
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
                  İptal
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-zinc-400 hover:text-white text-2xl" onClick={() => setSelectedImage(null)}>✕</button>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl">
            <img src={selectedImage} alt="Büyük" className="max-w-full max-h-[85vh] object-contain select-none" />
          </div>
        </div>
      )}
    </div>
  );
}