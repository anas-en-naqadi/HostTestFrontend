import type { Metadata } from "next";
import "../styles/globals.css";
import { Lora } from "next/font/google";
import Providers from "./providers";
import NavigationProvider from "./navigation-provider";
import { Toaster } from "sonner";
import AuthGuard from "@/components/layout/AuthGuard";
import ExitIntentPopup from "@/components/ui/ExitIntentPopup";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "My E-Learning Platform",
  description: "An interactive and scalable platform for online education.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="font-lora bg-white text-gray-900 custom-scrollbar">
        <NavigationProvider />
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
        <Toaster richColors position="top-right" />
        <ExitIntentPopup />
      </body>
    </html>
  );
}
