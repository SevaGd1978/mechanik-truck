"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { FleetProvider } from "@/components/fleet-provider";
import { WarehouseProvider } from "@/components/warehouse-provider";
import { ServiceProvider } from "@/components/service-provider";
import { TiresProvider } from "@/components/tires-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FleetProvider>
        <WarehouseProvider>
          <TiresProvider>
            <ServiceProvider>
              <AppShell>{children}</AppShell>
            </ServiceProvider>
          </TiresProvider>
        </WarehouseProvider>
      </FleetProvider>
    </AuthGuard>
  );
}
