# 📸 Düğün Fotoğrafçısı - Müşteri Galeri ve Seçim Sistemi

Bu proje, düğün ve özel gün fotoğrafçılarının müşterilerine profesyonel bir arayüzle fotoğraflarını sunabilmeleri, müşterilerin favori fotoğraflarını seçebilmeleri ve adminin bu süreci uçtan uca yönetebilmesi için geliştirilmiş **Full-Stack web uygulamasıdır**.

Zorunlu mühendislik stajı kapsamında, minimum uygulanabilir ürün (MVP) hedeflerinin ötesine geçilerek "Production (Canlı Ortam)" standartlarında geliştirilmiş ve Vercel üzerinde yayına alınmıştır.

🌐 **Canlı Demo:** [https://dugun-fotograf-sistemi-iota.vercel.app](https://dugun-fotograf-sistemi-iota.vercel.app)

---

## 1. Proje Amacı ve Kapsamı (Proje Raporu)
Düğün fotoğrafçıları çekim sonrası yüzlerce fotoğrafı genellikle WhatsApp, USB bellek veya Google Drive gibi karışık yapılarla teslim etmektedir. Bu durum, müşterinin fotoğrafları incelemesini ve albüm için favori seçmesini zorlaştırmaktadır. 

Bu sistem ile fotoğrafçı, her müşteri için özel, şifrelenebilir ve mobil uyumlu bir galeri oluşturur. Müşteri bu galeri üzerinden fotoğrafları inceler, favorilerini işaretler ve seçimi tamamladığında sistem galeriyi kilitleyerek fotoğrafçıya durumu bildirir.

### 1.1. Öne Çıkan Özellikler ve Kullanıcı Rolleri
* **Admin (Fotoğrafçı):** Güvenli giriş, galeri oluşturma/düzenleme, Cloudinary üzerinden çoklu fotoğraf yükleme, müşteri seçimlerini takip etme ve fotoğraflara otomatik "Watermark (Filigran)" ekleme. Ayrıca gelişmiş state yönetimi ile çoklu seçim ve toplu silme yapabilir.
* **Müşteri:** Kendisine özel oluşturulan dinamik link (`/gallery/[id]`) ile galeriye erişim, fotoğrafları tam ekran görüntüleme ve favori seçme işlemi.

---

## 2. Kullanılan Teknolojiler
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend:** Next.js API Routes (RESTful mimari)
* **Veritabanı:** MongoDB (Mongoose ODM)
* **Bulut Depolama:** Cloudinary (Görsel optimizasyonu)
* **Deploy:** Vercel

---

## 3. Veritabanı Mimarisi (Model Açıklaması)
Sistem NoSQL tabanlı MongoDB üzerinde 2 ana koleksiyon (Collection) ile kurgulanmıştır:

**`Gallery` Koleksiyonu**
Galerinin temel meta verilerini tutar.
* `title` (String): Galeri adı.
* `coupleName` (String): Çiftin adı.
* `eventDate` (Date): Organizasyon tarihi.
* `description` (String): Galeri açıklaması.
* `coverImage` (String): Kapak fotoğrafı URL'si.
* `password` (String): Opsiyonel galeri şifresi.
* `isActive` (Boolean): Galerinin erişime açık olma durumu.
* `isSelectionCompleted` (Boolean): Müşterinin seçimi bitirme durumu.

**`Photo` Koleksiyonu**[cite: 1]
Yüklenen görsellerin verilerini tutar.
* `galleryId` (ObjectId): Fotoğrafın ait olduğu galerinin ID'si (Gallery tablosu ile ilişkili).
* `url` (String): Cloudinary üzerinde tutulan görselin direkt adresi.
* `isFavorite` (Boolean): Müşterinin bu fotoğrafı favori seçip seçmediği[cite: 1].

---

## 4. Test Senaryoları ve Sonuçları
Projenin kararlı çalıştığını doğrulamak için aşağıdaki test senaryoları uygulanmıştır[cite: 1]:

| Test Senaryosu | Beklenen Sonuç | Durum |
| :--- | :--- | :---: |
| **Admin Yetkisiz Erişim Testi:** Giriş yapmadan `/admin` rotasına gidilmeye çalışılması. | Sistem kullanıcıyı otomatik olarak `/login` sayfasına yönlendirir (Route Protection). | ✅ Başarılı |
| **Hatalı Şifre Testi:** `/login` ekranında yanlış şifre girilmesi. | Ekranda "Hatalı kullanıcı adı veya şifre" uyarısı çıkar, sisteme girilemez. | ✅ Başarılı |
| **Galeri Oluşturma Testi:** Gerekli form alanları doldurularak yeni galeri eklenmesi. | MongoDB'de yeni döküman oluşur ve galeri listesinde anında görüntülenir. | ✅ Başarılı |
| **Toplu Fotoğraf Yükleme:** Aynı anda 10+ görselin yüklenmesi ve Watermark eklenmesi. | Client-side üzerinde görsellere filigran işlenir, Cloudinary'e yüklenir ve Progress Bar (Yükleme çubuğu) ile ilerleme gösterilir. | ✅ Başarılı |
| **Müşteri Favori Seçimi:** Müşteri linkinden girilip fotoğrafların beğenilmesi. | Veritabanında fotoğrafın `isFavorite` durumu anlık güncellenir, Admin panelinde "Müşteri Favorisi" olarak işaretlenir. | ✅ Başarılı |
| **Galeri Kilitleme Testi:** Müşterinin "Seçimi Tamamla" butonuna basması. | Galeri kilitlenir, Admin panelinde "Müşteri Seçimi Tamamladı" bildirimi çıkar ve seçimler değiştirilemez. | ✅ Başarılı |
| **Toplu Silme (Bulk Delete):** Adminin birden fazla fotoğraf seçip silmesi. | Seçilen fotoğraflar (Promise.all ile) veritabanından eşzamanlı olarak silinir. | ✅ Başarılı |

---

## 5. Kurulum ve Çalıştırma (Geliştiriciler İçin)
Projeyi lokal bilgisayarınızda çalıştırmak için:

**1. Repoyu Klonlayın:**
```bash
git clone [https://github.com/kullanici-adiniz/dugun-fotograf-sistemi.git](https://github.com/kullanici-adiniz/dugun-fotograf-sistemi.git)
cd dugun-fotograf-sistemi


**2. Paketleri Yükleyin:**

```bash
npm install

**3. Çevre Değişkenlerini (Environment Variables) Ayarlayın:**

Ana dizinde .env.local dosyası oluşturun ve bilgilerinizi girin:
MONGODB_URI=sizin_mongodb_baglantiniz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_sifreniz
CLOUDINARY_CLOUD_NAME=cloudinary_isminiz
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret

**4. Sunucuyu Başlatın:**
```bash
npm run dev