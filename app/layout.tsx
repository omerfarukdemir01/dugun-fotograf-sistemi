import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Şirketin istediği Metadata temizliği ve özelleştirme
export const metadata: Metadata = {
  title: "Studio Ömer | Profesyonel Düğün ve Etkinlik Fotoğrafçılığı",
  description: "Studio Ömer ile en özel anlarınızı profesyonel dokunuşlarla ölümsüzleştirin. Size özel fotoğraf galerileri ve hızlı erişim.",
  authors: [{ name: "Ömer Faruk" }],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. html lang="tr" yaparak Türkçe site olduğunu belirttik (SEO için kritik)
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}