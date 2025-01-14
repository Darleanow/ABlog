"use client";

import { AuthProvider } from "@/contexts/auth-context";

export function ClientAuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
