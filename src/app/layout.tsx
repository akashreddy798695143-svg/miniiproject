import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopZone - Your Ultimate E-Commerce Marketplace",
  description: "ShopZone offers the best deals on electronics, fashion, home & kitchen, beauty, and more. Free delivery, easy returns, and secure payments.",
  keywords: ["ShopZone", "E-Commerce", "Online Shopping", "Electronics", "Fashion", "India", "Deals", "Coupons"],
  authors: [{ name: "ShopZone Team" }],
  icons: {
    icon: "🛍️",
  },
  openGraph: {
    title: "ShopZone - Your Ultimate E-Commerce Marketplace",
    description: "Best deals on electronics, fashion, home & more",
    siteName: "ShopZone",
    type: "website",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
