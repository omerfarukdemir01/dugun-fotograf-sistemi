import mongoose, { Schema, model, models } from "mongoose";

const PhotoSchema = new Schema({
  galleryId: { type: String, required: true }, // Bu fotoğraf hangi galeriye ait?
  url: { type: String, required: true },       // Fotoğrafın bilgisayardaki/internetteki linki
  createdAt: { type: Date, default: Date.now } // Yüklenme zamanı
});

const Photo = models.Photo || model("Photo", PhotoSchema);

export default Photo;