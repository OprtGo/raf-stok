import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raf Admin',
  description: 'Stok Takip Uygulaması',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Raf',
  },
  themeColor: '#6ecdf9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
      <link rel="manifest" href="/manifest.json" />
  
      {/* iOS için doğru ikon boyutu ve isim */}
      <link rel="apple-touch-icon" href="/icon-192.png" />
  
      {/* Ekstra güvenli olsun diye tüm yaygın boyutları da ekleyelim */}
      <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
  
      <meta name="theme-color" content="#0066ff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="Raf" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}