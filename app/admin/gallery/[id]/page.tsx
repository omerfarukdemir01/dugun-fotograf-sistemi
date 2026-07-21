"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Next.js Image bileşeni eklendi

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
  password?: string;
  isActive?: boolean;
  coverImage?: string;
  isSelectionCompleted?: boolean;
  isNotificationRead?: boolean;
}

export default function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [failedUploads, setFailedUploads] = useState<File[]>([]);
  
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [gallery, setGallery] = useState<IGallery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<IGallery>({ 
    title: "", coupleName: "", eventDate: "", description: "", password: "", isActive: true 
  });

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("Ömer Faruk Photography");

  const fetchPhotos = useCallback(async () => {
    try {
      // API'ye limit=9999 parametresini ekleyerek admin için tüm fotoğrafların gelmesini sağlıyoruz
      const response = await fetch(`/api/photos?galleryId=${galleryId}&limit=9999&t=${Date.now()}`, { cache: "no-store" });
      const resData = await response.json();
      if (resData.success) {
        setPhotos(resData.data);
        setSelectedPhotoIds([]); 
      }
    } catch (error) {
      console.error("Fotoğraflar hata:", error);
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  const fetchGalleryInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}&t=${Date.now()}`, { cache: "no-store" });
      const resData = await response.json();
      if (resData.success) {
        setGallery(resData.data);
        setEditForm({
          title: resData.data.title || "",
          coupleName: resData.data.coupleName || "",
          eventDate: resData.data.date || "",
          description: resData.data.description || "",
          password: resData.data.password || "",
          isActive: resData.data.isActive !== undefined ? resData.data.isActive : true
        });
      }
    } catch (error) {
      console.error("Galeri bilgileri hata:", error);
    }
  }, [galleryId]);

  useEffect(() => {
    fetchPhotos();
    fetchGalleryInfo();
  }, [fetchPhotos, fetchGalleryInfo]);

  useEffect(() => {
    if (gallery?.isSelectionCompleted && gallery?.isNotificationRead === false) {
      const markAsRead = async () => {
        try {
          await fetch(`/api/gallery-info?id=${galleryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...gallery, isNotificationRead: true })
          });
          setGallery(prev => prev ? { ...prev, isNotificationRead: true } : null);
        } catch (error) {
          console.error("Bildirim okundu işaretlenemedi", error);
        }
      };
      markAsRead();
    }
  }, [gallery, galleryId]);

  const handleCopyFileNames = () => {
    const favoritePhotos = photos.filter(p => p.isFavorite);
    if (favoritePhotos.length === 0) return;
    
    const fileNames = favoritePhotos.map(p => {
      const fileName = p.url.substring(p.url.lastIndexOf('/') + 1).split('?')[0];
      return decodeURIComponent(fileName);
    }).join(', ');
    
    navigator.clipboard.writeText(fileNames);
    alert(`${favoritePhotos.length} adet fotoğrafın ismi panoya kopyalandı!\n\nLightroom veya bilgisayarınızdaki klasör arama kutusuna yapıştırarak fotoğrafları saniyeler içinde bulabilirsiniz.`);
  };

  const handleUnlockSelection = async () => {
    if (!window.confirm("DİKKAT: Galeriyi yeniden seçime açmak istediğinize emin misiniz?\n\nMüşteri tekrar seçim ekleyip çıkarabilecektir.")) return;
    
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gallery, isSelectionCompleted: false, isNotificationRead: false })
      });
      const resData = await response.json();
      
      if (resData.success) {
        setGallery(resData.data);
        alert("Galeri kilidi başarıyla açıldı! Müşteri tekrar seçim yapabilir.");
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

  const addWatermarkToImage = (file: File, text: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0);

          const fontSize = Math.floor(img.width * 0.06);
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((-45 * Math.PI) / 180);
          ctx.fillText(text, 0, 0);
          
          ctx.fillText(text, 0, -img.height * 0.4);
          ctx.fillText(text, 0, img.height * 0.4);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, file.type, 0.9);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Gelişmiş Toplu ve Kontrollü Yükleme Motoru
  const processUploadBatch = async (filesToUpload: File[]) => {
    setIsUploading(true);
    setFailedUploads([]); 
    let successCount = 0;
    let currentProgress = 0;
    const newFailed: File[] = [];

    setUploadProgress({ current: 0, total: filesToUpload.length });

    const uploadSingleFile = async (file: File) => {
      try {
        let fileToUpload: File | Blob = file;

        if (applyWatermark && watermarkText.trim() !== "") {
          fileToUpload = await addWatermarkToImage(file, watermarkText);
        }

        // 1. Sunucudan güvenli yükleme imzası ve kimlik bilgilerini al
        const sigRes = await fetch("/api/upload/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: `studio-omer/galeri_${galleryId}`, galleryId })
        });
        
        if (!sigRes.ok) {
          const errData = await sigRes.json().catch(() => ({ error: "Bilinmeyen API hatası" }));
          throw new Error(`İmza reddedildi: ${errData.error}`);
        }
        // Aşağıdaki satırda folder'ı responseFolder olarak alıyoruz ki çakışma olmasın
        const { timestamp, signature, folder: responseFolder, apiKey, cloudName } = await sigRes.json();

        // 2. Doğrudan Cloudinary Sunucularına Gönder (Vercel RAM'ini yormadan)
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", responseFolder);

        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        
        if (!cloudinaryRes.ok) throw new Error("Cloudinary yükleme hatası");
        const cloudinaryData = await cloudinaryRes.json();

        // 3. Başarılı yükleme bilgisini ve meta verileri lokal veritabanına işle
        const dbRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            galleryId,
            secure_url: cloudinaryData.secure_url,
            public_id: cloudinaryData.public_id,
            originalName: file.name.replace(/[^a-z0-9.]/gi, '_'),
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            bytes: cloudinaryData.bytes,
            format: cloudinaryData.format
          })
        });
        
        if (!dbRes.ok) throw new Error("Veritabanı kaydı hatası");

        successCount++;
      } catch (error) {
        console.error(`${file.name} yüklenemedi:`, error);
        newFailed.push(file);
      } finally {
        currentProgress++;
        setUploadProgress({ current: currentProgress, total: filesToUpload.length });
      }
    };

    // Aynı anda maksimum 3 görseli paralel yükle (Tarayıcı kilitlenmesini önler)
    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < filesToUpload.length; i += CONCURRENCY_LIMIT) {
      const chunk = filesToUpload.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map(file => uploadSingleFile(file)));
    }

    setIsUploading(false);
    setUploadProgress(null);
    
    if (successCount > 0) {
      fetchPhotos(); 
    }
    
    if (newFailed.length > 0) {
      setFailedUploads(newFailed);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    e.target.value = ""; 
    await processUploadBatch(fileArray);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`/api/photos?id=${photoId}`, { method: "DELETE" });
      const resData = await response.json();
      if (resData.success) fetchPhotos();
      else alert("Hata: " + resData.error);
    } catch {
      alert("Sunucu bağlantı hatası.");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedPhotoIds.length} adet fotoğrafı kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    
    try {
      // Tek tek döngüyle istek atmak yerine tek bir istekle tüm ID'leri gövdede (body) gönderiyoruz
      const response = await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedPhotoIds })
      });
      
      const resData = await response.json();
      
      if (resData.success) {
        alert(`${selectedPhotoIds.length} fotoğraf hem veritabanından hem de Cloudinary'den başarıyla temizlendi.`);
        fetchPhotos();
      } else {
        alert("Hata: " + resData.error);
      }
    } catch {
      alert("Toplu silme sırasında bir hata oluştu.");
    }
  };

  const handleSetCover = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gallery, coverImage: photoUrl })
      });
      const resData = await response.json();
      if (resData.success) {
        setGallery(resData.data);
        alert("Kapak fotoğrafı ayarlandı!");
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

const handleDeleteGallery = async () => {
    const adminPass = window.prompt("DİKKAT! Galeriyi tamamen silmek üzeresiniz.\n\nİşlemi onaylamak için lütfen ADMIN şifrenizi giriniz:");
    
    // Kullanıcı iptale bastıysa dur
    if (adminPass === null) return; 

    // Şifre boş girildiyse uyar
    if (adminPass.trim() === "") {
      alert("Hata: Şifre boş bırakılamaz!");
      return;
    }
    
    try {
      // 1. Girdiğin şifreyi API'ye gönderip doğrulatıyoruz
      const verifyRes = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass })
      });
      
      const verifyData = await verifyRes.json();

      // Şifre yanlışsa silmeyi iptal et
      if (!verifyData.success) {
        alert("Hata: Admin şifresi yanlış! Silme işlemi iptal edildi.");
        return;
      }

      // 2. Şifre doğruysa galeriyi sil
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, { method: "DELETE" });
      const resData = await response.json();
      
      if (resData.success) {
        alert("Galeri başarıyla silindi.");
        router.push("/admin");
      } else {
        alert("Silme hatası: " + resData.error);
      }
    } catch {
      alert("Sunucuyla iletişim kurulamadı, işlem başarısız.");
    }
  };

  const handleUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      }
    } catch {
      alert("Güncelleme hatası.");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const favoriteCount = photos.filter(photo => photo.isFavorite).length;
  const displayedPhotos = showOnlyFavorites ? photos.filter(photo => photo.isFavorite) : photos;
  
  const handleSelectAll = () => {
    if (selectedPhotoIds.length === displayedPhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(displayedPhotos.map(p => p._id));
    }
  };

  const selectedIndex = displayedPhotos.findIndex(p => p.url === selectedImage);

  useEffect(() => {
    if (showOnlyFavorites && favoriteCount === 0) {
      setTimeout(() => setShowOnlyFavorites(false), 0);
    }
  }, [favoriteCount, showOnlyFavorites]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "ArrowRight" && selectedIndex < displayedPhotos.length - 1) {
        setSelectedImage(displayedPhotos[selectedIndex + 1].url);
      } else if (e.key === "ArrowLeft" && selectedIndex > 0) {
        setSelectedImage(displayedPhotos[selectedIndex - 1].url);
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, selectedIndex, displayedPhotos]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < displayedPhotos.length - 1) {
      setSelectedImage(displayedPhotos[selectedIndex + 1].url);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      setSelectedImage(displayedPhotos[selectedIndex - 1].url);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link href="/admin" className="text-zinc-500 hover:text-black font-medium">← Geri Dön</Link>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIsEditing(true)} className="bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">✏️ Düzenle</button>
            <button onClick={handleDeleteGallery} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">🗑️ Sil</button>
            <button onClick={handleCopyLink} className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{isCopied ? "✓ Kopyalandı" : "🔗 Link Kopyala"}</button>
          </div>
        </div>

        <div className={`bg-white p-6 sm:p-8 rounded-2xl shadow-sm mb-8 border transition-all ${gallery?.isSelectionCompleted ? 'border-green-300 bg-green-50/40' : 'border-zinc-200'}`}>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">{gallery?.title}</h1>
            
            {gallery?.isSelectionCompleted && (
              <div className="flex items-center gap-2">
                <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                  ✓ Müşteri Seçimi Tamamladı
                </span>
                <button 
                  onClick={handleUnlockSelection}
                  className="bg-white hover:bg-zinc-100 text-zinc-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-zinc-300 shadow-sm transition-colors"
                >
                  🔓 Kilidi Aç
                </button>
              </div>
            )}

            {gallery?.isActive ? (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Aktif</span>
            ) : (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Pasif</span>
            )}
            {gallery?.password && (
              <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">🔒 Şifreli</span>
            )}
          </div>
          <p className="text-zinc-500 mt-2 max-w-2xl">{gallery?.description}</p>
        </div>

        <div className="mb-8">
          <div className="bg-white p-4 rounded-t-xl border border-zinc-300 border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={applyWatermark} 
                onChange={(e) => setApplyWatermark(e.target.checked)}
                className="w-4 h-4 text-black focus:ring-black rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-800">Yüklenen Fotoğraflara Filigran Ekle</span>
            </label>
            
            {applyWatermark && (
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <span className="text-xs text-zinc-500 font-medium">Metin:</span>
                <input 
                  type="text" 
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="flex-1 border border-zinc-300 rounded px-2 py-1 text-sm outline-none focus:border-black"
                  placeholder="Örn: Studio Ömer"
                />
              </div>
            )}
          </div>

          <div className="relative border-2 border-dashed border-zinc-300 rounded-b-xl p-8 sm:p-14 text-center hover:bg-zinc-50 hover:border-black transition-all cursor-pointer bg-white group overflow-hidden">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/jpg" 
              multiple 
              onChange={handleFileUpload} 
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            
            <div className="text-zinc-500 relative z-0">
              {isUploading && uploadProgress ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  
                  <span className="font-bold text-zinc-900 text-lg">
                    {applyWatermark ? "Filigran İşleniyor ve Yükleniyor..." : "Fotoğraflar Yükleniyor..."}
                  </span>
                  
                  <span className="bg-zinc-100 text-zinc-800 px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-200 shadow-sm">
                    {uploadProgress.current} / {uploadProgress.total} Tamamlandı
                  </span>
                  
                  <div className="w-full max-w-md h-2 bg-zinc-100 rounded-full overflow-hidden mt-1 ring-1 ring-inset ring-zinc-200">
                    <div 
                      className="h-full bg-black transition-all duration-300 ease-out" 
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-zinc-400 mb-4 group-hover:text-black transition-colors duration-300 group-hover:-translate-y-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="block font-bold text-zinc-900 text-xl mb-1">Fotoğrafları Sürükleyip Bırakın</span>
                  <span className="text-sm font-medium text-zinc-500">veya cihazınızdan topluca seçmek için tıklayın</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Başarısız Dosyalar için Yeniden Deneme Paneli */}
        {failedUploads.length > 0 && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-red-800 font-bold text-base">{failedUploads.length} fotoğraf yüklenemedi.</h4>
              <p className="text-red-600 text-xs sm:text-sm">Ağ bağlantısı kesintisi veya geçici bir hatadan dolayı bazı dosyalar aktarılamadı. Tarayıcıyı yenilemeden tekrar deneyebilirsiniz.</p>
            </div>
            <button 
              onClick={() => processUploadBatch(failedUploads)}
              className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
            >
              🔄 Hatalıları Tekrar Dene
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              {showOnlyFavorites ? 'Favori Fotoğraflar' : 'Tüm Fotoğraflar'} ({displayedPhotos.length})
            </h3>
            {displayedPhotos.length > 0 && (
              <button 
                onClick={handleSelectAll} 
                className="text-xs font-medium text-zinc-500 hover:text-black transition-colors underline underline-offset-2"
              >
                {selectedPhotoIds.length === displayedPhotos.length ? 'Seçimi Temizle' : 'Tümünü Seç'}
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {favoriteCount > 0 && (
              <button 
                onClick={handleCopyFileNames} 
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-blue-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                İsimleri Kopyala
              </button>
            )}

            {favoriteCount > 0 && (
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  showOnlyFavorites 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-inset ring-red-600/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                {showOnlyFavorites ? `Tüm Fotoğraflara Dön (${photos.length})` : `Sadece Favorileri Göster (${favoriteCount})`}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500 py-10 text-center">Fotoğraflar yükleniyor...</div>
        ) : displayedPhotos.length === 0 ? (
          <div className="text-sm text-zinc-500 bg-white p-10 rounded-xl text-center border border-zinc-200 shadow-sm">
            {showOnlyFavorites ? "Hiç favori fotoğraf bulunamadı." : "Bu galeriye henüz fotoğraf yüklenmemiş."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedPhotos.map((photo) => (
              <div 
                key={photo._id} 
                className={`group relative aspect-square rounded-xl overflow-hidden border-4 transition-all cursor-zoom-in 
                  ${selectedPhotoIds.includes(photo._id) ? 'ring-2 ring-black border-transparent scale-95 opacity-90' : gallery?.coverImage === photo.url ? 'border-blue-500 hover:shadow-md' : 'border-transparent hover:shadow-md'}`} 
                onClick={() => setSelectedImage(photo.url)}
              >
                <Image 
                  src={photo.url} 
                  alt="Fotoğraf" 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw" 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-2 items-start">
                  <input 
                    type="checkbox"
                    checked={selectedPhotoIds.includes(photo._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIds(prev => prev.includes(photo._id) ? prev.filter(id => id !== photo._id) : [...prev, photo._id]);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded cursor-pointer text-black focus:ring-black border-zinc-300 shadow-sm"
                  />
                  {photo.isFavorite && (
                    <div className="bg-red-500 text-white p-1.5 rounded-full shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" /></svg>
                    </div>
                  )}
                </div>
                
                {gallery?.coverImage === photo.url && (
                  <div className="absolute bottom-0 inset-x-0 bg-blue-500/90 text-white text-[10px] font-bold text-center py-1 z-10 uppercase tracking-widest pointer-events-none">Kapak</div>
                )}
                
                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleSetCover(photo.url); }} className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1.5 rounded text-[10px] sm:text-xs font-semibold hover:bg-blue-600 shadow-sm transition-colors">Kapak</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo._id); }} className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1.5 rounded text-[10px] sm:text-xs font-semibold hover:bg-red-600 shadow-sm transition-colors">Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhotoIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl z-40 flex items-center gap-6 w-[90%] sm:w-auto justify-between border border-zinc-800 transition-all duration-300">
          <span className="font-medium text-sm sm:text-base whitespace-nowrap">
            {selectedPhotoIds.length} fotoğraf seçildi
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedPhotoIds([])} className="px-3 py-1.5 text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors">
              İptal
            </button>
            <button onClick={handleBulkDelete} className="px-4 py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-500 rounded-lg font-bold transition-colors shadow-lg">
              Seçilenleri Sil
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-zinc-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto py-12">
          <form onSubmit={handleUpdateGallery} className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-2 border-b border-zinc-100 pb-4">
              <h2 className="text-xl font-bold text-zinc-900">Galeriyi Düzenle</h2>
              <button type="button" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-black">✕</button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Galeri Adı</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border border-zinc-300 p-2.5 rounded-lg focus:ring-1 focus:ring-black outline-none" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Tarih</label>
              <input type="date" value={editForm.eventDate} onChange={e => setEditForm({...editForm, eventDate: e.target.value})} className="w-full border border-zinc-300 p-2.5 rounded-lg focus:ring-1 focus:ring-black outline-none" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Açıklama</label>
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full border border-zinc-300 p-2.5 rounded-lg focus:ring-1 focus:ring-black outline-none h-20 resize-none" />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Galeri Şifresi (İsteğe Bağlı)</label>
              <input type="text" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full border border-zinc-300 p-2.5 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-black outline-none font-mono" placeholder="Şifresiz olması için boş bırakın" />
            </div>

            <label className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 mt-4 cursor-pointer select-none">
              <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="w-4 h-4 text-black focus:ring-black rounded" />
              <span className="text-sm font-medium text-zinc-800">Galeri Erişime Açık (Aktif)</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-zinc-100 mt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-zinc-100 text-zinc-700 p-2.5 rounded-lg font-medium hover:bg-zinc-200 transition-colors">İptal</button>
              <button type="submit" className="flex-1 bg-black text-white p-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors">Kaydet</button>
            </div>
          </form>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-zinc-400 hover:text-white text-3xl z-50" onClick={() => setSelectedImage(null)}>✕</button>
          
          {selectedIndex > 0 && (
            <button onClick={handlePrev} className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}

          <div className="relative w-[95vw] sm:w-[90vw] max-w-6xl h-[80vh] flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
            {displayedPhotos[selectedIndex]?.isFavorite && (
              <div className="absolute top-4 left-4 sm:left-0 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-10 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">Müşteri Favorisi</span>
              </div>
            )}
            
            <Image 
              src={selectedImage} 
              alt="Büyük Görsel" 
              fill 
              sizes="100vw"
              className="object-contain select-none shadow-2xl px-4 sm:px-0" 
            />
          </div>

          {selectedIndex < displayedPhotos.length - 1 && (
            <button onClick={handleNext} className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}