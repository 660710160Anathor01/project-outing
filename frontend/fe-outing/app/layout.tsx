import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Providers from "./_component/providers";
import { AuthProvider } from "./_component/auth-provider";
import SideBar from "@/src/_component/side-bar";

export const metadata: Metadata = {
  title: "Outing Registration",
  description: "Outing Registration & Trip Report",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background">
      <Providers>
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <SideBar />

        <main className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  </Providers>

      </body>
    </html>
  );
}
