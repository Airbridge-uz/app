import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: "SkySearch - AI-Powered Flight Search",
  description: "Find the best flights with AI-powered search. Compare prices, discover deals, and book with confidence.",
  keywords: ["flight search", "AI travel", "cheap flights", "travel assistant", "SkySearch"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-paper text-ink">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
