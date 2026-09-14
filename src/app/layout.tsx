import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/admin-shell";
import { ThemeProvider } from "@/components/theme-provider";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ormission Admin Portal — কেন্দ্রীয় প্রশাসন প্যানেল",
  description: "কোর্স তৈরি, মূল্য নির্ধারণ, লেসন ও ভিডিও আপলোড, শিক্ষার্থী এবং অর্ডার পরিচালনার সম্পূর্ণ অ্যাডমিন সিস্টেম।",
  icons: {
    icon: [
      { url: "/images/brand-logo-v2.png?v=2026", sizes: "512x512", type: "image/png" },
      { url: "/icon.png?v=2026", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png?v=2026", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2026",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/brand-logo-v2.png?v=2026" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico?v=2026" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2026" />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        <ThemeProvider>
          <AdminShell>{children}</AdminShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
