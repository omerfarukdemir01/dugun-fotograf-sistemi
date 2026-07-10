import mongoose, { Schema, model, models } from "mongoose";

const PhotoSchema = new Schema({
  galleryId: { type: String, required: true },
  url: { type: String, required: true },
  isFavorite: { type: Boolean, default: false }, // EKLENEN KISIM: Başlangıçta hiçbir fotoğraf favori değildir (false)
  createdAt: { type: Date, default: Date.now }
});

const Photo = models.Photo || model("Photo", PhotoSchema);

export default Photo;