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

export const metadata: Metadata = {
  title: "Gudang Online",
  description: "Aplikasi Manajemen Stok Teh Poci",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      
      {/* PERUBAHAN DI SINI: */}
      {/* 1. Menambahkan ${geistMono.variable} agar font mono juga terdaftar */}
      {/* 2. Menambahkan class 'bg-light' agar background halaman jadi abu-abu muda */}
      <body className={`${geistSans.variable} ${geistMono.variable} bg-light`}>
        
        {/* TAMBAHAN NAVBAR */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
          <div className="container">
            <span className="navbar-brand fw-bold mb-0 h1">🥤 GudangApp</span>
          </div>
        </nav>

        {/* Konten Halaman */}
        {children}

        {/* Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}