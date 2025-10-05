import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "AstroQuiz - Astronomi Bilgi Yarışması",
  description: "NASA Space Apps Challenge - Astronomi soruları oluştur, cevapla ve puan kazan!",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico", // public/favicon.ico
    apple: "/favicon.png", // istersens apple touch icon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Navigation />
        </Suspense>
        <main className="min-h-screen">{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
