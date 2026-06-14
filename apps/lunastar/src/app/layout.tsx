import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunaStar - Giochi da Tavolo",
  description: "Gioca a giochi da tavolo multiplayer: Comic Hazard, Mercante in Fiera, UNO e altri!",
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
