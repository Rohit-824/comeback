import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'comeBack — Delhi Engineering Support Network',
  description: 'Turn your academic back into a comeback.',
  icons: {
    icon: '/icon.png', // Ensure your file in src/app/ is named icon.png
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#121212] text-slate-100 min-h-screen flex flex-col justify-between`}>
        {/* AuthProvider wraps everything so useAuth() works on every page */}
        <AuthProvider>
          <div className="flex-1 flex flex-col justify-between min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}