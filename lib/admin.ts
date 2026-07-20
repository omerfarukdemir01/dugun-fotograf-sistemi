import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getSession();
  
  // Oturum yoksa hata fırlatma, sadece false dön. 
  // API rotalarımız bunu yakalayıp 401 döndürecek.
  if (!session) {
    return false;
  }

  return true;
}