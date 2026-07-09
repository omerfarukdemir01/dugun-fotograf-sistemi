import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

// POST isteği: Yeni bir veri kaydetmek için kullanılır
export async function POST(request: Request) {
  try {
    // 1. Gelen form verilerini oku
    const { title, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
    }

    // 2. Veritabanına bağlan
    await connectToDatabase();

    // 3. Veritabanında yeni bir galeri dökümanı oluştur
    const newGallery = await Gallery.create({
      title,
      date,
    });

    // 4. Başarılı sonucunu tarayıcıya geri dön
    return NextResponse.json({ success: true, data: newGallery }, { status: 201 });

  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Veritabanına kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}
// GET isteği: Veritabanındaki tüm galerileri çekip listelemek için kullanılır
export async function GET() {
  try {
    // 1. Veritabanına bağlan
    await connectToDatabase();

    // 2. Tüm galerileri oluşturulma tarihine göre en yeni en üstte olacak şekilde çek
    const galleries = await Gallery.find({}).sort({ createdAt: -1 });

    // 3. Verileri tarayıcıya başarıyla dön
    return NextResponse.json({ success: true, data: galleries }, { status: 200 });
    
  } catch (error) {
    console.error("API GET Hatası:", error);
    return NextResponse.json({ error: "Galeriler yüklenirken bir hata oluştu." }, { status: 500 });
  }
}