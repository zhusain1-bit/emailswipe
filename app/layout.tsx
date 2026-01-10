import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmailSwipe - Tinder for your inbox",
  description: "Swipe through emails in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
