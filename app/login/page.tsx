"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Next.js Image bileşeni eklendi

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh(); 
      } else {
        setError(true);
      }
    } catch  {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-stone-900 font-sans selection:bg-rose-200 selection:text-stone-900">
      
      {/* SOL TARAF - GÖRSEL (Sadece tablet ve masaüstünde görünür) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-stone-900 overflow-hidden">
        {/* Düz img kaldırıldı, yerine performans ve LCP dostu Next.js Image yerleştirildi */}
        <Image 
          src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop" 
          alt="Studio Yönetim Paneli Giriş Arka Plan Görseli" 
          fill
          priority // İlk yüklemede göründüğü için hızlı açılması adına priority eklendi
          sizes="50vw"
          className="object-cover opacity-80 hover:scale-105 transition-transform duration-[10s]"
        />
        {/* Karartma efekti (Gradient) */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent"></div>
        
        <div className="absolute bottom-16 left-16 text-white z-10 animate-fade-in-up">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 opacity-70">Hoş Geldiniz</p>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">Zamansız <br/><span className="italic font-light">Anlar.</span></h2>
          <p className="text-stone-300 font-light tracking-wide max-w-sm text-sm leading-relaxed">
            Müşteri galerilerine ve stüdyo yönetim paneline erişim sağlamak için bilgilerinizi girin.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 bg-[#FAFAFA] relative">
        
        {/* Geri Dön Butonu */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
           <Link href="/" className="text-[10px] tracking-[0.2em] text-stone-500 hover:text-stone-900 uppercase transition-colors flex items-center gap-2">
             <span>←</span> Ana Sayfa
           </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl font-serif tracking-widest mb-4">STUDIO <span className="italic text-stone-500">Ömer</span></h1>
            <div className="w-12 h-px bg-stone-300 mb-6"></div>
            <p className="text-stone-500 text-sm font-light">Sisteme giriş yapmak için lütfen bilgilerinizi doldurun.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Kullanıcı Adı</label>
              <input 
                type="text" required 
                value={username} onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-transparent border-b ${error ? 'border-rose-400' : 'border-stone-300'} pb-3 text-stone-800 focus:outline-none focus:border-stone-800 transition-colors`}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Şifre</label>
              <input 
                type="password" required 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-transparent border-b ${error ? 'border-rose-400' : 'border-stone-300'} pb-3 text-stone-800 tracking-widest font-serif focus:outline-none focus:border-stone-800 transition-colors`}
              />
              {error && <p className="text-rose-500 text-xs mt-3 tracking-wide">Hatalı kullanıcı adı veya şifre.</p>}
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-stone-900 text-stone-50 text-xs tracking-[0.2em] uppercase py-5 mt-4 hover:bg-stone-700 transition-all duration-500 disabled:opacity-50">
              {loading ? "Doğrulanıyor..." : "Giriş Yap"}
            </button>
          </form>
          
          <div className="mt-16 text-center">
             <p className="text-[10px] uppercase tracking-widest text-stone-400">© 2026 Studio Ömer</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}