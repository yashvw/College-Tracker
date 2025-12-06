import type React from "react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import "./globals.css"

const epilogue = Epilogue({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "College Tracker",
  description: "College Tracker - attendance and habit tracker",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "College Tracker",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Aptos:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>College Tracker</title>
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <meta name="theme-color" content="#2096F3" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="College Tracker" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ fontFamily: epilogue.style.fontFamily }} className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
