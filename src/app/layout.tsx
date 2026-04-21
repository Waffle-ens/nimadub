import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nimadub - Dev Ops Console",
  description: "AI-driven development operations console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
