import type { Metadata, Viewport } from "next";
import { ARAYUZ } from "@/content/tr";
import Footer from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: ARAYUZ.siteBasligi,
  description: ARAYUZ.siteAciklamasi,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <noscript>
          <style>{`html body{overflow:auto!important}.statik-kunye{position:static!important;width:auto!important;height:auto!important;clip:auto!important}`}</style>
        </noscript>
        {children}
        <Footer />
      </body>
    </html>
  );
}
