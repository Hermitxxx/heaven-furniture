import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heaven Furniture — Made-to-Order Furniture in Chattogram",
  description:
    "Beds, sofas and wardrobes built to fit your room. Visit our showroom on Agrabad Access Road, Chattogram, or call +880 1960-481983 for a free consultation.",
  openGraph: {
    title: "Heaven Furniture — Made-to-Order Furniture in Chattogram",
    description:
      "Beds, sofas and wardrobes built to fit your room. Free consultation, delivery and fitting across Chattogram.",
    siteName: "Heaven Furniture",
    locale: "en_BD",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme='dark'
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, playfairDisplayHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
