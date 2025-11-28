import type React from "react"
import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "Manage and view agencies and contacts with role-based access control",
  generator: "agency-dashboard",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#48CFCB",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const content = (
    <html
      lang="en"
      style={
        {
          "--font-poppins": poppins.style.fontFamily,
          "--font-inter": inter.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )

  return publishableKey ? <ClerkProvider>{content}</ClerkProvider> : content
}
