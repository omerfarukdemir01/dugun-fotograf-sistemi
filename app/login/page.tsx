export default function LoginPage() {
  return (
    // Ekranı ikiye böleceğimiz ana kapsayıcı
    <div className="flex min-h-screen font-sans bg-white">
      
      {/* SOL TARAF: Görsel ve Marka Alanı (Sadece büyük ekranlarda görünür) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 text-white lg:flex">
        {/* İleride buraya <Image /> etiketiyle gerçek bir fotoğraf eklenebilir, şimdilik şık bir desen/renk */}
        <div className="absolute inset-0 bg-zinc-900 bg-[url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"></div>
        
        {/* Sol Üst Logo */}
        <div className="relative z-10">
          <h2 className="text-3xl font-light tracking-wide">
            Studio<span className="font-bold">Panel</span>
          </h2>
        </div>

        {/* Sol Alt Karşılama Metni */}
        <div className="relative z-10 mt-auto max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight">
            Anıları güvenle paylaşın.
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Müşterilerinize özel galeriler oluşturun, fotoğrafları yüksek kalitede sunun ve favori seçimlerini tek bir ekrandan kolayca yönetin.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF: Giriş Formu */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          
          {/* Mobil ekranlar için Logo (Sadece mobilde görünür) */}
          <div className="mb-10 text-center lg:hidden">
             <h2 className="text-3xl font-light tracking-wide text-zinc-900">
              Studio<span className="font-bold">Panel</span>
            </h2>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-zinc-900">Hoş Geldiniz</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Yönetim paneline erişmek için lütfen giriş yapın.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Kullanıcı Adı</label>
              <input 
                type="text" 
                placeholder="admin" 
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Şifre</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-700">Beni hatırla</label>
              </div>
              <a href="#" className="text-sm font-medium text-zinc-900 hover:underline">Şifremi unuttum</a>
            </div>

            <button 
              type="button" 
              className="mt-4 flex w-full justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}