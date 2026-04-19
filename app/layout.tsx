import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'زيّ — Zayy | أناقة كلاسيكية',
  description: 'أناقة كلاسيكية — Classic Elegance',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#111111',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = JSON.parse(localStorage.getItem('my-store-data') || '{}');
                var theme = s?.state?.theme;
                var lang = s?.state?.language;
                if (theme === 'dark') document.documentElement.classList.add('dark');
                if (lang === 'en') {
                  document.documentElement.setAttribute('dir', 'ltr');
                  document.documentElement.setAttribute('lang', 'en');
                }
              } catch(e) {}
              document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
              document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && ['u','s','a'].includes(e.key.toLowerCase())) e.preventDefault();
              });
            `
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 600,
                fontSize: 13,
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}