import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProvider from './components/ClientProvider';
import Footer from './components/Footer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Your System Name",
  description: "Your system description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}
