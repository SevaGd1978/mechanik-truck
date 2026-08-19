"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { FleetProvider } from "@/components/fleet-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FleetProvider>
        <AppShell>{children}</AppShell>
      </FleetProvider>
    </AuthGuard>
  );
}
