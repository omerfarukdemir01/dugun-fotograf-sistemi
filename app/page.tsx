"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-800 font-sans selection:bg-rose-200 selection:text-stone-900">
      
      {/* ZARİF ÜST MENÜ */}
      <header className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/50 to-transparent py-6 md:py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8">
          <div className="text-xl md:text-2xl font-serif tracking-widest text-white">
            STUDIO <span className="italic text-stone-300">Ömer</span>
          </div>
          
          {/* SAĞ KISIM: MENÜ VE GİRİŞ BUTONU */}
          <div className="flex items-center gap-4 md:gap-10">
            
            {/* Sadece Masaüstünde Görünen Yazılı Menü */}
            <nav className="hidden md:flex gap-10 text-xs tracking-[0.2em] uppercase text-stone-200 font-medium items-center">
              <a href="#hikayemiz" className="hover:text-rose-300 transition-colors duration-300">Hikayemiz</a>
              <a href="#hizmetler" className="hover:text-rose-300 transition-colors duration-300">Hizmetler</a>
              <a href="#portfolyo" className="hover:text-rose-300 transition-colors duration-300">Portfolyo</a>
              <a href="#iletisim" className="hover:text-rose-300 transition-colors duration-300">İletişim</a>
            </nav>
            
            {/* Mobilde ve Masaüstünde Her Zaman Görünen Giriş Butonu */}
            <Link 
              href="/login" 
              className="px-4 py-2 md:px-6 md:py-2.5 bg-white text-stone-900 text-[10px] md:text-xs tracking-[0.2em] uppercase hover:bg-rose-100 transition-all duration-300 rounded-sm"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* SİNEMATİK HERO - ARKADA FOTOĞRAFLA */}
        <section className="relative w-full h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0">
             <img 
               src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
               alt="Hero Wedding" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-stone-900/40"></div> 
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up mt-12 text-white">
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase mb-6 opacity-80">Zamansız Zarafet • Sanatsal Dokunuş</p>
            <h1 className="text-4xl md:text-7xl font-serif mb-8 leading-tight">
              En Güzel Hikayeniz, <br />
              <span className="italic font-light">Sanata Dönüşüyor.</span>
            </h1>
            <p className="text-sm md:text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed opacity-90 px-4">
              Düğün, nişan ve en özel anlarınızı, bir dergi kapağı zarafetinde belgeliyor; nesilden nesile aktarılacak görsel miraslar yaratıyoruz.
            </p>
            <a 
              href="#iletisim" 
              className="inline-block bg-white text-stone-900 px-8 py-3 md:px-10 md:py-4 text-xs md:text-sm tracking-widest uppercase hover:bg-stone-100 transition-all duration-500 hover:shadow-2xl"
            >
              Randevu Oluştur
            </a>
          </div>
        </section>

        {/* HİZMETLERİMİZ */}
        <section id="hizmetler" className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-6">Özel Gün Hizmetlerimiz</h2>
            <div className="w-px h-12 md:h-16 bg-stone-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJpZGV8ZW58MHx8MHx8fDA%3D" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Düğün Belgeseli</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm">Hazırlık telaşınızdan, ilk dansınıza kadar tüm duygusal anlarınızı sinematik bir zarafetle kayıt altına alıyoruz.</p>
            </div>
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop" className="w-full h-64 object-cover mb-6 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Doğa & Dış Çekim</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm">Gün ışığının en yumuşak saatlerinde, doğanın romantik dokusuyla aşkınızı en saf haliyle fotoğraflıyoruz.</p>
            </div>
            <div className="text-center group">
              <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop" className="w-full h-64 object-cover mb-6 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-serif mb-4 text-stone-800">Save the Date</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm">Sevdiklerinize tarihinizi duyurmanız için, tarzınızı yansıtan, yaratıcı ve sanatsal kısa hikayeler oluşturuyoruz.</p>
            </div>
          </div>
        </section>

        {/* PORTFOLYO - GERÇEK FOTOĞRAFLARLA */}
        <section id="portfolyo" className="py-24 px-6 bg-stone-100/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Seçili Kareler</h2>
                <div className="w-12 h-px bg-stone-400"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop" className="md:col-span-2 aspect-[16/9] object-cover rounded-sm" />
              <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" className="aspect-[3/4] object-cover rounded-sm" />
              <img src="https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YnJpZGV8ZW58MHx8MHx8fDA%3D" />
              <img src="https://images.unsplash.com/photo-1550784718-990c6de52adf?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJyaWRlfGVufDB8fDB8fHww" />
              <img src="https://images.unsplash.com/photo-1492175742197-ed20dc5a6bed?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJyaWRlfGVufDB8fDB8fHww" />

            </div>
          </div>
        </section>

        {/* İLETİŞİM */}
        <section id="iletisim" className="py-24 md:py-32 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-stone-900">Kahvenizi İçerken<br/><span className="italic text-stone-500">Detayları Konuşalım.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 border-t border-stone-200 pt-16">
             <div className="flex flex-col items-center"><span className="text-2xl mb-4">📍</span><p className="text-sm font-light">Melikgazi/Kayseri</p></div>
             <div className="flex flex-col items-center"><span className="text-2xl mb-4">📞</span><p className="text-sm font-light">+90 555 123 45 67</p></div>
             <div className="flex flex-col items-center"><span className="text-2xl mb-4">✉️</span><p className="text-sm font-light">hello@studioomer.com</p></div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-16 text-center text-sm font-light">
        <div className="text-xl md:text-2xl font-serif tracking-widest text-stone-300 mb-6">STUDIO <span className="italic text-stone-500">Ömer</span></div>
        <p>© 2026 Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}