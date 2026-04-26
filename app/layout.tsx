import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCAT Companion",
  description: "A personal MCAT mistake tracking, diagnosis, and recommendation companion."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
