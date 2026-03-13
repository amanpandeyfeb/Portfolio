import type { Metadata } from "next";
import { Bebas_Neue, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Change Project Portfolio",
  description: "A resume-powered portfolio built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${bebasNeue.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
