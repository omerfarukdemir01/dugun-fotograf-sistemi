# 📸 Düğün Fotoğrafçısı - Müşteri Galeri ve Seçim Sistemi

Bu proje, düğün ve özel gün fotoğrafçılarının müşterilerine profesyonel bir arayüz üzerinden fotoğraflarını sunabilmeleri, müşterilerin favori fotoğraflarını seçebilmeleri ve tüm sürecin admin tarafından yönetilebilmesi amacıyla geliştirilmiş **Full-Stack web uygulamasıdır**.

Proje, zorunlu mühendislik stajı kapsamında minimum uygulanabilir ürün (MVP) hedeflerinin ötesine geçilerek **production (canlı ortam)** standartlarında geliştirilmiş ve **Vercel** üzerinde yayınlanmıştır.

🌐 **Canlı Demo:** https://dugun-fotograf-sistemi-iota.vercel.app

---

# 1. Proje Amacı ve Kapsamı

Düğün fotoğrafçıları çekim sonrasında yüzlerce fotoğrafı çoğunlukla WhatsApp, USB bellek veya Google Drive gibi platformlar üzerinden müşterilerine ulaştırmaktadır. Bu yöntemler hem fotoğrafların düzenli sunulmasını hem de müşterilerin albüm için favori seçimlerini zorlaştırmaktadır.

Bu sistem sayesinde fotoğrafçı her müşteri için özel bir galeri oluşturabilir. Müşteri kendisine ait bağlantı üzerinden galeriyi görüntüleyebilir, favori fotoğraflarını seçebilir ve seçimini tamamladığında sistem galeriyi kilitleyerek fotoğrafçıya bilgi verir.

---

# 2. Özellikler

## Admin (Fotoğrafçı)

- Güvenli admin girişi
- Galeri oluşturma, düzenleme ve silme
- Cloudinary üzerinden toplu fotoğraf yükleme
- Fotoğraflara otomatik watermark (filigran) ekleme
- Müşteri seçimlerini görüntüleme
- Çoklu fotoğraf seçme ve toplu silme
- Galeri durumunu yönetme

## Müşteri

- Kendisine özel galeri bağlantısı üzerinden erişim
- Tam ekran fotoğraf görüntüleme
- Favori fotoğraf seçebilme
- Seçimi tamamladıktan sonra galerinin otomatik kilitlenmesi

---

# 3. Kullanılan Teknolojiler

## Frontend

- Next.js (App Router)
- React
- Tailwind CSS

## Backend

- Next.js API Routes
- RESTful API

## Veritabanı

- MongoDB
- Mongoose ODM

## Bulut Servisi

- Cloudinary

## Deployment

- Vercel

---

# 4. Veritabanı Yapısı

## Gallery

Galeriye ait temel bilgileri tutar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| title | String | Galeri adı |
| coupleName | String | Çiftin adı |
| eventDate | Date | Organizasyon tarihi |
| description | String | Galeri açıklaması |
| coverImage | String | Kapak görseli |
| password | String | Opsiyonel galeri şifresi |
| isActive | Boolean | Galerinin aktiflik durumu |
| isSelectionCompleted | Boolean | Müşteri seçimi tamamladı mı |

## Photo

Yüklenen fotoğrafları tutar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| galleryId | ObjectId | Bağlı olduğu galeri |
| url | String | Cloudinary görsel adresi |
| isFavorite | Boolean | Müşteri tarafından seçildi mi |

---

# 5. Test Senaryoları

| Test | Beklenen Sonuç | Durum |
|------|----------------|:----:|
| Yetkisiz admin erişimi | Kullanıcı login sayfasına yönlendirilir | ✅ |
| Hatalı admin girişi | Hata mesajı gösterilir | ✅ |
| Yeni galeri oluşturma | MongoDB'ye kayıt eklenir | ✅ |
| Toplu fotoğraf yükleme | Watermark uygulanarak Cloudinary'ye yüklenir | ✅ |
| Favori fotoğraf seçimi | isFavorite değeri güncellenir | ✅ |
| Galeriyi tamamlama | Galeri kilitlenir | ✅ |
| Toplu fotoğraf silme | Seçilen fotoğraflar başarıyla silinir | ✅ |

---

# 6. Kurulum

## 1. Repoyu Klonlayın

```bash
git clone https://github.com/omerfarukdemir01/dugun-fotograf-sistemi.git
cd dugun-fotograf-sistemi
``` 

## 2. Bağımlılıkları Kurun

```bash
npm install
```

## 3. Environment Variables

Proje dizininde `.env.local` dosyası oluşturun.

```env
MONGODB_URI=your_mongodb_connection_string

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Ardından tarayıcıdan aşağıdaki adresi açın:

```
http://localhost:3000
```

---

# 7. Deployment

Proje **Vercel** üzerinde yayınlanmıştır.

Deployment sırasında gerekli environment variable değerlerinin Vercel Project Settings bölümüne eklenmesi gerekmektedir.

---

# 8. Lisans

Bu proje, zorunlu mühendislik stajı kapsamında geliştirilmiş örnek bir uygulamadır.