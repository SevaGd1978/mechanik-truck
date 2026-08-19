"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
