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
  title: "Trenity - Stream Movies & TV Shows",
  description: "Watch your favorite movies and TV shows online. Browse, search, and stream a vast library of entertainment content.",
  keywords: ["Trenity", "streaming", "movies", "TV shows", "watch online", "entertainment"],
  authors: [{ name: "Trenity" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Trenity - Stream Movies & TV Shows",
    description: "Watch your favorite movies and TV shows online",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trenity - Stream Movies & TV Shows",
    description: "Watch your favorite movies and TV shows online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
