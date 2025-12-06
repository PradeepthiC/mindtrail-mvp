// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";

const geistSans = GeistSans({ subsets: ["latin"] });
const geistMono = GeistMono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindTrail",
  description: "Capture and revisit your insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
