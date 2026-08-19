import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mechanik Truck · FMS",
  description:
    "Облачная система управления автопарком в стиле macOS: топливо, сервис, осмотры, путевые листы и отчёты.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" suppressHydrationWarning className="h-full">
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
