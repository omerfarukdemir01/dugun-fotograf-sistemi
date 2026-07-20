import { Schema, model, models } from "mongoose";

const GallerySchema = new Schema({
  title: { type: String, required: true },
  eventDate: { type: Date, required: true }, // 'date' yerine 'eventDate' kullanıldı ve tipi Date yapıldı
  coupleName: { type: String },
  description: { type: String },
  photoCount: { type: Number, default: 0 },
  
  // ÖNCEKİ ÖZELLİKLER
  password: { type: String, default: "" }, 
  isActive: { type: Boolean, default: true }, 
  coverImage: { type: String, default: "" }, 
  
  // SİPARİŞ VE BİLDİRİM YÖNETİMİ
  isSelectionCompleted: { type: Boolean, default: false }, 
  isNotificationRead: { type: Boolean, default: false }, 
}, { 
  timestamps: true // createdAt ve updatedAt otomatik eklenecek
});

// Performans için sıralama indeksi (Admin sayfasında galerileri listelerken hızı artırır)
GallerySchema.index({ createdAt: -1 });

const Gallery = models.Gallery || model("Gallery", GallerySchema);
export default Gallery;