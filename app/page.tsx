"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-800 font-sans selection:bg-rose-200 selection:text-stone-900">
      
      {/* ZARİF ÜST MENÜ */}
      <header className="absolute top-0 w-full z-50 bg-transparent py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
          <div className="text-2xl font-serif tracking-widest text-stone-900">
            STUDIO <span className="italic text-stone-500">Ömer</span>
          </div>
          <nav className="hidden md:flex gap-10 text-xs tracking-[0.2em] uppercase text-stone-600 font-medium">
            <a href="#hikayemiz" className="hover:text-rose-400 transition-colors duration-300">Hikayemiz</a>
            <a href="#hizmetler" className="hover:text-rose-400 transition-colors duration-300">Hizmetler</a>
            <a href="#portfolyo" className="hover:text-rose-400 transition-colors duration-300">Portfolyo</a>
            <a href="#iletisim" className="hover:text-rose-400 transition-colors duration-300">İletişim</a>
          </nav>
        </div>
      </header>

      <main>
        {/* SİNEMATİK HERO - ARKADA FOTOĞRAFLA */}
        <section className="relative w-full h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {/* Arka Plan Fotoğrafı */}
          <div className="absolute inset-0">
             <img 
               src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
               alt="Hero Wedding" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-stone-900/40"></div> {/* Yazı okunsun diye overlay */}
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up mt-12 text-white">
            <p className="text-xs tracking-[0.3em] uppercase mb-6 opacity-80">Zamansız Zarafet • Sanatsal Dokunuş</p>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
              En Güzel Hikayeniz, <br />
              <span className="italic font-light">Sanata Dönüşüyor.</span>
            </h1>
            <p className="text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed opacity-90">
              Düğün, nişan ve en özel anlarınızı, bir dergi kapağı zarafetinde belgeliyor; nesilden nesile aktarılacak görsel miraslar yaratıyoruz.
            </p>
            <a 
              href="#iletisim" 
              className="inline-block bg-white text-stone-900 px-10 py-4 text-sm tracking-widest uppercase hover:bg-stone-100 transition-all duration-500 hover:shadow-2xl"
            >
              Randevu Oluştur
            </a>
          </div>
        </section>

        {/* HİZMETLERİMİZ */}
        <section id="hizmetler" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-serif text-stone-900 mb-6">Özel Gün Hizmetlerimiz</h2>
            <div className="w-px h-16 bg-stone-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1532712938310-08cb3da880a3?q=80&w=600&auto=format&fit=crop" className="w-full h-64 object-cover mb-6 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Düğün Belgeseli</h3>
              <p className="text-stone-500 font-light leading-relaxed">Hazırlık telaşınızdan, ilk dansınıza kadar tüm duygusal anlarınızı sinematik bir zarafetle kayıt altına alıyoruz.</p>
            </div>
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop" className="w-full h-64 object-cover mb-6 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Doğa & Dış Çekim</h3>
              <p className="text-stone-500 font-light leading-relaxed">Gün ışığının en yumuşak saatlerinde, doğanın romantik dokusuyla aşkınızı en saf haliyle fotoğraflıyoruz.</p>
            </div>
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop" className="w-full h-64 object-cover mb-6 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Save the Date</h3>
              <p className="text-stone-500 font-light leading-relaxed">Sevdiklerinize tarihinizi duyurmanız için, tarzınızı yansıtan, yaratıcı ve sanatsal kısa hikayeler oluşturuyoruz.</p>
            </div>
          </div>
        </section>

        {/* PORTFOLYO - GERÇEK FOTOĞRAFLARLA */}
        <section id="portfolyo" className="py-24 px-6 bg-stone-100/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-serif text-stone-900 mb-4">Seçili Kareler</h2>
                <div className="w-12 h-px bg-stone-400"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop" className="md:col-span-2 aspect-[16/9] object-cover rounded-sm" />
              <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" className="aspect-[3/4] object-cover rounded-sm" />
              <img src="https://images.unsplash.com/photo-1519225421980-715cb0315aed?q=80&w=800&auto=format&fit=crop" className="aspect-[3/4] object-cover rounded-sm" />
              <img src="https://images.unsplash.com/photo-1469371670807-013ccf246830?q=80&w=800&auto=format&fit=crop" className="md:col-span-2 aspect-[16/9] object-cover rounded-sm" />
            </div>
          </div>
        </section>

        {/* İLETİŞİM */}
        <section id="iletisim" className="py-32 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-12 text-stone-900">Kahvenizi İçerken<br/><span className="italic text-stone-500">Detayları Konuşalım.</span></h2>
          <div className="grid md:grid-cols-3 gap-12 border-t border-stone-200 pt-16">
             {/* İletişim detayları aynı kalabilir */}
             <div className="flex flex-col items-center"><span className="text-xl mb-4">📍</span><p className="text-sm font-light">Zarafet Sokak, Kahramanmaraş</p></div>
             <div className="flex flex-col items-center"><span className="text-xl mb-4">📞</span><p className="text-sm font-light">+90 555 123 45 67</p></div>
             <div className="flex flex-col items-center"><span className="text-xl mb-4">✉️</span><p className="text-sm font-light">hello@studioomer.com</p></div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-16 text-center text-sm font-light">
        <div className="text-2xl font-serif tracking-widest text-stone-300 mb-6">STUDIO <span className="italic text-stone-500">Ömer</span></div>
        <p>© 2026 Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}