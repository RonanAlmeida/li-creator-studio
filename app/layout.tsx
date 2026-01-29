import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Creator Studio | LinkedIn",
  description: "Transform your LinkedIn posts into engaging videos",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&family=Bebas+Neue&family=Reddit+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Header />
        <main className="pt-[56px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
