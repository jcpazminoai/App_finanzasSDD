import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-provider';
import { GraphqlProvider } from '@/lib/apollo/provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Finanzas',
  description: 'Frontend MVP para la app de finanzas personales'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} root-layout`}>
        <GraphqlProvider>
          <AuthProvider>{children}</AuthProvider>
        </GraphqlProvider>
      </body>
    </html>
  );
}
