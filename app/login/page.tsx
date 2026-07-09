"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Giriş başarılıysa tarayıcı hafızasına (session) küçük bir kilit anahtarı bırakıyoruz
        localStorage.setItem("isAdminAuthenticated", "true");
        // Ve admin paneline uçuruyoruz
        router.push("/admin");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Sunucuyla bağlantı kurulamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-200">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide text-zinc-900">
            Studio<span className="font-bold">Panel</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Lütfen yönetim paneline giriş yapın.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Kullanıcı Adı</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Şifre</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}