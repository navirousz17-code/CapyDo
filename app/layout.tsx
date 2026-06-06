import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CapyDo — Do more. Capy happy.',
  description: 'A warm, friendly todo app to keep your tasks organized and your day on track.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fdf9ed',
              color: '#5c4022',
              border: '1px solid #d9b98f',
              borderRadius: '12px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: {
              iconTheme: { primary: '#5aa352', secondary: '#fdf9ed' },
            },
            error: {
              iconTheme: { primary: '#a67640', secondary: '#fdf9ed' },
            },
          }}
        />
      </body>
    </html>
  );
}
