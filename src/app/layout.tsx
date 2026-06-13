import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hub Centrale",
  description: "Central hub for all services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#141414] text-white">
        {children}
      </body>
    </html>
  );
}
