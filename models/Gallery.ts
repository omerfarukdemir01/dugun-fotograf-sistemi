import mongoose, { Schema, model, models } from "mongoose";

const GallerySchema = new Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  coupleName: { type: String },
  description: { type: String },
  photoCount: { type: Number, default: 0 },
  
  // YENİ EKLENEN ÖZELLİKLER
  password: { type: String, default: "" }, // Şifre boşsa herkes direkt girebilir
  isActive: { type: Boolean, default: true }, // Yeni açılan galeriler otomatik aktiftir
  coverImage: { type: String, default: "" }, // Kapak fotoğrafının dosya yolu (URL)
  
  createdAt: { type: Date, default: Date.now }
});

const Gallery = models.Gallery || model("Gallery", GallerySchema);
export default Gallery;