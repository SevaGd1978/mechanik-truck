import type { Metadata } from "next";
import { RootProviders } from "@/components/root-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mechanik Truck · FMS",
  description:
    "Облачная система управления автопарком в стиле macOS: сервис, склад, автопарк и отчёты.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" suppressHydrationWarning className="h-full">
      <body className="min-h-full font-sans antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
