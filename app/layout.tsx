import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jolly Phonics Learning",
  description: "Fun phonics learning app for kids aged 4-7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
        <script src="https://cdn.jsdelivr.net/gh/winniek75/wise-xp-sdk@main/wise-xp.js" />
        {children}
      </body>
    </html>
  );
}
