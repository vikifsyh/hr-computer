import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/auth/authProvider";

export const metadata: Metadata = {
  title: "HR Computer - Jual Beli dan Service Laptop",
  description: "E Commerce Website",
  icons: {
    icon: "/image/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
