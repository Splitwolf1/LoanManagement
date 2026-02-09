import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { CommandPaletteProvider } from "@/providers/command-palette-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import PWAWrapper from "@/components/PWAWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toronto Impact Initiative - Loan Management",
  description: "Community loan management system for Toronto Impact Initiative",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TII Loans",
    startupImage: [
      {
        url: "/icons/icon-192x192.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  openGraph: {
    type: "website",
    siteName: "Toronto Impact Initiative - Loan Management",
    title: "Toronto Impact Initiative - Loan Management",
    description: "Community loan management system for Toronto Impact Initiative",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Toronto Impact Initiative Logo"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Toronto Impact Initiative - Loan Management",
    description: "Community loan management system for Toronto Impact Initiative",
    images: ["/icons/icon-512x512.png"]
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <CommandPaletteProvider>
                <PWAWrapper>
                  {children}
                </PWAWrapper>
              </CommandPaletteProvider>
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
