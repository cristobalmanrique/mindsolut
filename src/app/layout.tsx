import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Mindsolut",
  description: "Herramientas y recursos para resolver, practicar y aprender.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}