"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartProvider";
import { MarketplaceShell } from "@/components/layout/MarketplaceShell";
import { WorkspaceBranding } from "@/components/layout/WorkspaceBranding";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { SwrProvider } from "@/lib/swr/SwrProvider";

export function Providers({ children }) {
  return (
    <SwrProvider>
      <WorkspaceProvider>
        <WorkspaceBranding />
        <AuthProvider>
          <CartProvider>
            <MarketplaceShell>{children}</MarketplaceShell>
          </CartProvider>
        </AuthProvider>
      </WorkspaceProvider>
    </SwrProvider>
  );
}
