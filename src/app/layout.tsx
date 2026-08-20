import type { Metadata, Viewport } from "next";
import { RootProviders } from "@/components/root-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mechanik Truck · FMS",
  description:
    "Облачная система управления автопарком: сервис, склад, автопарк, путевые листы и отчёты.",
  applicationName: "Mechanik Truck",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mechanik Truck",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8e8ed" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" suppressHydrationWarning className="h-full">
      <body className="min-h-full min-h-[100dvh] font-sans antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
