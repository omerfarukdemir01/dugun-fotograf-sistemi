"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      // İstek /api/login rotasına gidiyor
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API'ye hem kullanıcı adını hem şifreyi gönderiyoruz
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        // Çerez sunucu tarafından yerleştirildi, admin paneline geç
        router.push("/admin");
        router.refresh(); 
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 font-sans text-stone-900">
      <div className="bg-white p-10 rounded-3xl w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 text-center">
        <h1 className="text-2xl font-serif tracking-widest mb-2">STUDIO <span className="italic text-stone-500">Ömer</span></h1>
        <p className="text-stone-500 text-sm mb-8 font-light">Yönetim paneline erişmek için giriş yapın.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" required placeholder="Kullanıcı Adı"
              value={username} onChange={(e) => setUsername(e.target.value)}
              className={`w-full bg-transparent border-b-2 ${error ? 'border-rose-400' : 'border-stone-200'} px-4 py-3 text-center focus:outline-none focus:border-stone-500 transition-colors`}
            />
          </div>
          <div>
            <input 
              type="password" required placeholder="Şifre"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-transparent border-b-2 ${error ? 'border-rose-400' : 'border-stone-200'} px-4 py-3 text-center tracking-[0.3em] font-serif focus:outline-none focus:border-stone-500 transition-colors mt-2`}
            />
            {error && <p className="text-rose-500 text-xs mt-3 tracking-wide">Hatalı kullanıcı adı veya şifre.</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-stone-50 text-sm tracking-widest uppercase font-medium py-4 rounded-none hover:bg-stone-700 transition-colors duration-500 mt-6 disabled:opacity-50">
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}