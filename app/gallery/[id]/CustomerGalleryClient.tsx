"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface IPhoto {
  _id: string;
  url: string;
  isFavorite: boolean;
}

interface IGallery {
  title: string;
  description: string;
  password?: string;
  isActive: boolean;
  coverImage?: string;
  isSelectionCompleted?: boolean;
}

export default function CustomerGalleryClient({ galleryId }: { galleryId: string }) {
  const [gallery, setGallery] = useState<IGallery | null>(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State'leri ('page' değişkeni kullanılmadığı için sadece setPage alınıyor)
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const isLocked = gallery?.isSelectionCompleted;

  // Orijinal URL'yi optimize edilmiş thumbnail URL'sine çeviren fonksiyon
  const getThumbnailUrl = (url: string) => {
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/c_fill,w_400,q_auto,f_auto/');
    }
    return url;
  };

  useEffect(() => {
    const fetchGalleryInfo = async () => {
      try {
        const response = await fetch(`/api/gallery-info?id=${galleryId}&t=${Date.now()}`, { cache: "no-store" });
        const resData = await response.json();
        if (resData.success) {
          setGallery(resData.data);
          // Backend'den gelen isAuthorized bilgisini doğrudan kullanıyoruz
          if (resData.isAuthorized) setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Galeri bilgileri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryInfo();
  }, [galleryId]);

  // Sayfalama (Pagination) destekli fetchPhotos fonksiyonu
  const fetchPhotos = useCallback(async (pageNum: number, isInitial = false) => {
    if (!isAuthorized) return;
    
    if (pageNum > 1) setLoadingMore(true);
    
    try {
      const response = await fetch(`/api/photos?galleryId=${galleryId}&page=${pageNum}&limit=30&t=${Date.now()}`, { cache: "no-store" });
      const resData = await response.json();
      
      if (resData.success) {
        if (isInitial) {
          setPhotos(resData.data);
        } else {
          setPhotos(prev => {
            // Mükerrer kayıtları önlemek için id kontrolü yapıyoruz
            const existingIds = new Set(prev.map(p => p._id));
            const newPhotos = resData.data.filter((p: IPhoto) => !existingIds.has(p._id));
            return [...prev, ...newPhotos];
          });
        }
        
        // Gelen veri limiti (30) doldurmuyorsa daha fazla veri kalmamıştır
        setHasMore(resData.data.length === 30);
      }
    } catch (error) {
      console.error("Fotoğraflar yüklenirken hata:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [galleryId, isAuthorized]);

  // İlk yetki onaylandığında sadece 1. sayfayı çek
  useEffect(() => {
    if (isAuthorized) {
      setPage(1);
      fetchPhotos(1, true);
    }
  }, [isAuthorized, fetchPhotos]);

  // Infinite Scroll Gözlemcisi
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !showOnlyFavorites) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchPhotos(nextPage);
          return nextPage;
        });
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, fetchPhotos, showOnlyFavorites]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false);

    try {
      // Şifreyi sunucudaki gallery-auth endpoint'ine gönderip doğruluyoruz
      const response = await fetch("/api/gallery-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryId, password: inputPassword })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setIsAuthorized(true);
        setPasswordError(false);
      } else {
        setPasswordError(true);
        setInputPassword("");
      }
    } catch (error) {
      console.error("Şifre doğrulanırken hata oluştu:", error);
      setPasswordError(true);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, photoId: string, currentStatus: boolean) => {
    e.stopPropagation(); 
    
    if (isLocked) {
      alert("Seçiminiz stüdyoya iletilmiştir. Artık değişiklik yapılamaz.");
      return;
    }

    const newStatus = !currentStatus;
    setPhotos(photos.map(photo => photo._id === photoId ? { ...photo, isFavorite: newStatus } : photo));

    try {
      const response = await fetch("/api/photos/favorite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isFavorite: newStatus })
      });
      const resData = await response.json();
      if (!resData.success) {
        setPhotos(photos.map(photo => photo._id === photoId ? { ...photo, isFavorite: currentStatus } : photo));
      }
    } catch {
      setPhotos(photos.map(photo => photo._id === photoId ? { ...photo, isFavorite: currentStatus } : photo));
    }
  };

  const handleCompleteSelection = async () => {
    const confirmLock = window.confirm(
      "DİKKAT: Seçimlerinizi tamamlayıp stüdyoya iletmek üzeresiniz.\n\nBu işlemden sonra fotoğraflar üzerinde değişiklik (ekleme/çıkarma) yapamayacaksınız. Onaylıyor musunuz?"
    );

    if (!confirmLock) return;

    try {
      const dataToUpdate = { 
        ...gallery, 
        isSelectionCompleted: true, 
        isNotificationRead: false 
      };
      const response = await fetch(`/api/gallery-info?id=${galleryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToUpdate)
      });
      const resData = await response.json();
      
      if (resData.success) {
        setGallery(resData.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("İşlem sırasında bir hata oluştu.");
      }
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const favoriteCount = photos.filter(photo => photo.isFavorite).length;
  const displayedPhotos = showOnlyFavorites ? photos.filter(photo => photo.isFavorite) : photos;
  
  const selectedPhoto = photos.find(p => p._id === selectedPhotoId);
  const selectedIndex = displayedPhotos.findIndex(p => p._id === selectedPhotoId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhotoId) return;
      if (e.key === "ArrowRight" && selectedIndex < displayedPhotos.length - 1) {
        setSelectedPhotoId(displayedPhotos[selectedIndex + 1]._id);
      } else if (e.key === "ArrowLeft" && selectedIndex > 0) {
        setSelectedPhotoId(displayedPhotos[selectedIndex - 1]._id);
      } else if (e.key === "Escape") {
        setSelectedPhotoId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoId, selectedIndex, displayedPhotos]);

  useEffect(() => {
    if (showOnlyFavorites && favoriteCount === 0) {
      setTimeout(() => setShowOnlyFavorites(false), 0);
    }
  }, [favoriteCount, showOnlyFavorites]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < displayedPhotos.length - 1) {
      setSelectedPhotoId(displayedPhotos[selectedIndex + 1]._id);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      setSelectedPhotoId(displayedPhotos[selectedIndex - 1]._id);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-stone-400 font-serif text-xl animate-pulse">Zarafet Yükleniyor...</div>;

  if (gallery && gallery.isActive === false) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-center px-4 font-sans text-stone-800">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-8 border border-stone-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-stone-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
        </div>
        <h1 className="text-3xl font-serif text-stone-900 mb-4">Erişime Kapalı</h1>
        <p className="text-stone-500 max-w-md font-light leading-relaxed">Bu özel albüm geçici olarak erişime kapatılmıştır. Lütfen detaylar için stüdyonuzla iletişime geçin.</p>
      </div>
    );
  }

  if (gallery && gallery.password && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 font-sans">
        <div className="bg-white p-12 rounded-3xl w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Özel Koleksiyon</p>
          <h2 className="text-3xl font-serif text-stone-900 mb-2">{gallery.title}</h2>
          <div className="w-12 h-px bg-stone-300 mx-auto mb-8"></div>
          
          <p className="text-stone-500 text-sm mb-10 font-light">Anılarınıza ulaşmak için lütfen size özel iletilen şifreyi giriniz.</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <input 
                type="password" required placeholder="Albüm Şifresi"
                value={inputPassword} onChange={(e) => setInputPassword(e.target.value)}
                className={`w-full bg-transparent border-b-2 ${passwordError ? 'border-rose-400' : 'border-stone-200'} px-4 py-3 text-stone-900 text-center tracking-[0.3em] font-serif focus:outline-none focus:border-stone-500 transition-colors`}
              />
              {passwordError && <p className="text-rose-500 text-xs mt-3 tracking-wide">Hatalı şifre, lütfen tekrar deneyin.</p>}
            </div>
            <button type="submit" className="w-full bg-stone-900 text-stone-50 text-sm tracking-widest uppercase font-medium py-4 rounded-none hover:bg-stone-700 transition-colors duration-500 mt-4">
              Galeriyi Görüntüle
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-800 font-sans selection:bg-rose-200 selection:text-stone-900 relative">
      
      <header className={`absolute top-0 w-full z-40 p-8 ${gallery?.coverImage ? 'bg-gradient-to-b from-stone-900/60 to-transparent' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors ${gallery?.coverImage ? 'text-stone-300 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}>
            &larr; Vitrine Dön
          </Link>
          <div className={`text-xl font-serif tracking-widest ${gallery?.coverImage ? 'text-white drop-shadow-md' : 'text-stone-900'}`}>
            STUDIO <span className={`italic ${gallery?.coverImage ? 'text-stone-300' : 'text-stone-500'}`}>Ömer</span>
          </div>
        </div>
      </header>

      {gallery?.coverImage ? (
        <div className="relative w-full h-[60vh] md:h-[75vh] flex items-end justify-center pb-20">
          <Image 
            src={gallery.coverImage} 
            alt="Kapak Fotoğrafı" 
            fill
            priority
            sizes="100vw"
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/20 to-transparent"></div>
          
          <div className="relative z-10 text-center px-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6 drop-shadow-sm">{gallery.title}</h1>
            {gallery.description && <p className="text-stone-600 max-w-2xl mx-auto text-lg font-light italic">&quot;{gallery.description}&quot;</p>}
          </div>
        </div>
      ) : (
        <div className="pt-40 pb-20 text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-6">Özel Koleksiyon</p>
          <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6">{gallery?.title}</h1>
          <div className="w-12 h-px bg-stone-300 mx-auto mb-6"></div>
          <p className="text-stone-500 max-w-2xl mx-auto font-light">{gallery?.description}</p>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-40 pt-8">
        
        {isLocked ? (
          <div className="mb-16 flex flex-col items-center justify-center bg-stone-100/80 p-6 rounded-2xl border border-stone-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-stone-800">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-stone-900 mb-2">Seçimleriniz İletildi</h3>
            <p className="text-stone-500 text-sm font-light text-center">Toplam <span className="font-medium text-stone-800">{favoriteCount}</span> fotoğraf stüdyomuza başarıyla ulaştı. İlginiz için teşekkür ederiz.</p>
          </div>
        ) : (
          <div className="mb-16 flex flex-col md:flex-row items-center justify-center gap-4">
            {photos.length > 0 && favoriteCount > 0 && (
              <>
                <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-all duration-500 ${showOnlyFavorites ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-sm' : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 shadow-sm'}`}>
                  {showOnlyFavorites ? `Tüm Koleksiyon (${photos.length})` : `Seçilenler (${favoriteCount})`}
                </button>
                
                <button 
                  onClick={handleCompleteSelection} 
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm tracking-widest uppercase bg-stone-900 text-white hover:bg-stone-700 transition-all duration-500 shadow-xl shadow-stone-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                  Seçimi Tamamla
                </button>
              </>
            )}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-32 text-stone-400 font-light max-w-md mx-auto">
            <p className="text-xl font-serif mb-4 text-stone-500">Bu albüm henüz hazırlanıyor.</p>
            <p className="text-sm">Sanatsal dokunuşlar tamamlandığında fotoğraflarınız burada yerini alacak.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {displayedPhotos.map((photo, index) => {
                // Sona gelindiğini tespit etmek için observer referansını son elemana ekliyoruz
                const isLastElement = index === displayedPhotos.length - 1;
                
                return (
                  <div 
                    key={photo._id} 
                    ref={isLastElement ? lastElementRef : null}
                    onClick={() => setSelectedPhotoId(photo._id)} 
                    className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-zoom-in border border-stone-100"
                  >
                    <Image 
                      src={getThumbnailUrl(photo.url)} 
                      alt="Galeri Karesi" 
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                    />
                    
                    {isLocked ? (
                      photo.isFavorite && (
                         <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                           <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-rose-400/90 text-white shadow-sm cursor-default">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                           </div>
                         </div>
                      )
                    ) : (
                      <div className={`absolute top-3 right-3 md:top-4 md:right-4 z-10 transition-opacity duration-500 ${photo.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button onClick={(e) => handleToggleFavorite(e, photo._id, !!photo.isFavorite)} className={`flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${photo.isFavorite ? 'bg-rose-400/90 text-white scale-110 shadow-[0_4px_15px_rgba(251,113,133,0.3)]' : 'bg-white/60 text-stone-500 hover:bg-white/90 hover:scale-110 hover:text-rose-400 shadow-sm'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Sonsuz Kaydırma Yükleniyor Göstergesi */}
            {loadingMore && !showOnlyFavorites && (
              <div className="w-full flex justify-center mt-12 mb-8">
                <div className="flex items-center gap-3 text-stone-400 font-serif">
                  <svg className="animate-spin h-5 w-5 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Daha fazla fotoğraf yükleniyor...</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/95 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPhotoId(null)}>
          <button className="absolute top-8 right-8 text-stone-400 hover:text-white text-sm tracking-widest uppercase z-50 transition-colors" onClick={() => setSelectedPhotoId(null)}>Kapat ✕</button>
          
          {selectedIndex > 0 && (
            <button onClick={handlePrev} className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}

          <div className="relative w-[95vw] sm:w-[90vw] max-w-6xl h-[80vh] flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={selectedPhoto.url} 
              alt="Büyük Görünüm" 
              fill
              sizes="100vw"
              className="object-contain select-none shadow-2xl px-4 sm:px-0" 
            />
            
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {isLocked ? (
                selectedPhoto.isFavorite && (
                  <div className="px-8 py-3 rounded-full text-sm tracking-widest uppercase bg-stone-900 text-stone-300 border border-stone-800 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-400"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                    Seçildi
                  </div>
                )
              ) : (
                <button onClick={(e) => handleToggleFavorite(e, selectedPhoto._id, !!selectedPhoto.isFavorite)} className={`flex items-center gap-3 px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${selectedPhoto.isFavorite ? 'bg-rose-100 text-rose-800' : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white backdrop-blur-md'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                  {selectedPhoto.isFavorite ? 'Seçildi' : 'Seçime Ekle'}
                </button>
              )}
            </div>
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