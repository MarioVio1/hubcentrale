import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MangaFlow - Leggi manga online gratis",
  description: "MangaFlow è la tua app per leggere manga online. Accedi a migliaia di manga da diverse fonti tra cui MangaWorld, MangaDex e altro. Leggi i tuoi manga preferiti gratuitamente.",
  keywords: ["MangaFlow", "manga", "manga online", "leggi manga", "MangaWorld", "MangaDex", "manga gratis", "scanlation", "capitoli manga"],
  authors: [{ name: "MangaFlow Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "MangaFlow - Leggi manga online gratis",
    description: "La tua app per leggere manga online con accesso a migliaia di titoli da diverse fonti.",
    url: "https://mangaflow.app",
    siteName: "MangaFlow",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MangaFlow - Leggi manga online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MangaFlow - Leggi manga online gratis",
    description: "La tua app per leggere manga online con accesso a migliaia di titoli.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
