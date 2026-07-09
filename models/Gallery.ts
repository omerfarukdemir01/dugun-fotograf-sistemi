import mongoose, { Schema, model, models } from "mongoose";

// Veritabanına galerinin yapısını öğretiyoruz
const GallerySchema = new Schema({
  title: { type: String, required: true }, // Çiftlerin Adı (Zorunlu)
  date: { type: String, required: true },  // Düğün Tarihi (Zorunlu)
  photoCount: { type: Number, default: 0 }, // İçindeki fotoğraf sayısı (Varsayılan: 0)
  isActive: { type: Boolean, default: true }, // Galeri yayında mı? (Varsayılan: Aktif)
  createdAt: { type: Date, default: Date.now } // Oluşturulma tarihi
});

// Eğer bu model hafızada zaten varsa onu kullan, yoksa yeni oluştur
const Gallery = models.Gallery || model("Gallery", GallerySchema);

export default Gallery;