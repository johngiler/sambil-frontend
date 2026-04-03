"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartProvider";
import { MarketplaceShell } from "@/components/layout/MarketplaceShell";
import { WorkspaceBranding } from "@/components/layout/WorkspaceBranding";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export function Providers({ children }) {
  return (
    <WorkspaceProvider>
      <WorkspaceBranding />
      <AuthProvider>
        <CartProvider>
          <MarketplaceShell>{children}</MarketplaceShell>
        </CartProvider>
      </AuthProvider>
    </WorkspaceProvider>
  );
}
