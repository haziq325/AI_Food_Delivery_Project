import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftBite — Delivered with Precision",
  description: "AI-powered food delivery. Order from the best restaurants in Karachi.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="food-grain-bg min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
