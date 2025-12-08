import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raf Admin',
  description: 'Stok Takip Uygulaması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Burada önceden <nav> veya <div> içinde "SALE" yazıları vardı.
         Hepsini sildik, sadece {children} kaldı.
         {children} demek: O an hangi sayfadaysan (Giriş, Admin vb.) sadece onu göster demek.
      */}
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}