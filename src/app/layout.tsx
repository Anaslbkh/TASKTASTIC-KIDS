import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider'; // Import AuthProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import NavBar from '@/components/NavBar'; // Import NavBar

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskTastic Kids',
  description: 'A fun app for children to learn and complete tasks!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-sky-100 via-rose-50 to-yellow-50 dark:from-sky-900 dark:via-rose-900 dark:to-yellow-900`} suppressHydrationWarning={true}>
        <AuthProvider>
          <NavBar /> {/* Render NavBar above children */}
          {children}
          <Toaster /> {/* Add Toaster for notifications */}
        </AuthProvider>
      </body>
    </html>
  );
}
