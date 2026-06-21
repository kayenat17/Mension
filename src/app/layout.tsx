import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mension",
  description: "Understand if that message was toxic — in the context of your cycle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-charcoal antialiased min-h-screen flex flex-col md:flex-row font-sans">
        {children}
      </body>
    </html>
  );
}
