"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { canAccessRoute } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (!canAccessRoute(currentUser, pathname)) {
      router.replace("/");
    }
  }, [ready, currentUser, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center text-[13px] text-[var(--fg-secondary)]">
        Загрузка…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-full items-center justify-center text-[13px] text-[var(--fg-secondary)]">
        Переход к входу…
      </div>
    );
  }

  if (!canAccessRoute(currentUser, pathname)) {
    return (
      <div className="flex min-h-full items-center justify-center text-[13px] text-[var(--fg-secondary)]">
        Нет доступа…
      </div>
    );
  }

  return <>{children}</>;
}
