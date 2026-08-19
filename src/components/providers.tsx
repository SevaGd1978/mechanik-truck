"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { FleetProvider } from "@/components/fleet-provider";
import { WarehouseProvider } from "@/components/warehouse-provider";
import { ServiceProvider } from "@/components/service-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FleetProvider>
        <WarehouseProvider>
          <ServiceProvider>
            <AppShell>{children}</AppShell>
          </ServiceProvider>
        </WarehouseProvider>
      </FleetProvider>
    </AuthGuard>
  );
}
