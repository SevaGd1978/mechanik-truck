"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { FleetProvider } from "@/components/fleet-provider";
import { WarehouseProvider } from "@/components/warehouse-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FleetProvider>
        <WarehouseProvider>
          <AppShell>{children}</AppShell>
        </WarehouseProvider>
      </FleetProvider>
    </AuthGuard>
  );
}
