"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartProvider";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
