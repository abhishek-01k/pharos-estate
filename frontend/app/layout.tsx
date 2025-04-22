import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "./client";
import { ContractsProvider } from "@/context/ContractsContext";
import { PHAROS_CHAIN_CONFIG } from "@/config/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PharosEstate | Commercial Real Estate Tokenization Platform",
  description: "A decentralized platform for fractional ownership of commercial real estate through tokenization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider
          supportedChains={[PHAROS_CHAIN_CONFIG]}
          activeChain={PHAROS_CHAIN_CONFIG}
          clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        >
          <ContractsProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ContractsProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
