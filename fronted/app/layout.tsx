import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCMap — Bedrock World Viewer",
  description: "Live top-down map of your Minecraft Bedrock server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}