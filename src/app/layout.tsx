import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConsoleStoreProvider } from "@/components/providers/ConsoleStore";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EAiQ — The AI orchestration layer for managing IT Assets",
  description:
    "One knowledge graph grounded, auditable view of every asset, risk and change. Empowering decision from the assets to the boardroom.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ConsoleStoreProvider>{children}</ConsoleStoreProvider>
      </body>
    </html>
  );
}
