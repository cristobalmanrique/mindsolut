import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindsolut",
  description: "Herramientas y recursos para resolver, practicar y aprender ...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
