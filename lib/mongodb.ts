import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Güvenlik Kontrolü: Eğer .env.local dosyasındaki şifre linki okunamazsa sistemi durdurur
if (!MONGODB_URI) {
  throw new Error("Lütfen .env.local dosyasındaki MONGODB_URI değerini kontrol edin.");
}

export const connectToDatabase = async () => {
  try {
    // Performans Optimizasyonu: Eğer halihazırda açık bir tünel (bağlantı) varsa, yenisini açma, olanı kullan
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }
    
    // Veritabanı ile ilk el sıkışma ve bağlantıyı başlatma
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("Veritabanı bağlantısı başarılı!");
    return conn;
    
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
    throw error;
  }
};