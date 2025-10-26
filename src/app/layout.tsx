import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// export const metadata = {
//   title: "Price Ninja",
//   description: "PriceNinja — анализ цен и товаров.",
//   verification: {
//     google: "cbJ17nOtbRhYABH7nl0NBNpNl8RbHdBtmG7C-YFPjVw",
//     yandex: "b093a6c3558efc9e",
//   },
// };

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Price Ninja",
  description: "PriceNinja — анализ цен и товаров.",
  verification: {
    google: "cbJ17nOtbRhYABH7nl0NBNpNl8RbHdBtmG7C-YFPjVw",
    yandex: "b093a6c3558efc9e",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
