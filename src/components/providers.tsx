"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { FleetProvider } from "@/components/fleet-provider";
import { WarehouseProvider } from "@/components/warehouse-provider";
import { ServiceProvider } from "@/components/service-provider";
import { TiresProvider } from "@/components/tires-provider";
import { WaybillsProvider } from "@/components/waybills-provider";
import { DriversProvider } from "@/components/drivers-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FleetProvider>
        <DriversProvider>
          <WarehouseProvider>
            <TiresProvider>
              <WaybillsProvider>
                <ServiceProvider>
                  <AppShell>{children}</AppShell>
                </ServiceProvider>
              </WaybillsProvider>
            </TiresProvider>
          </WarehouseProvider>
        </DriversProvider>
      </FleetProvider>
    </AuthGuard>
  );
}
