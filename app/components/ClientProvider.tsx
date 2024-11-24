"use client";

import { SettingsProvider } from "../contexts/SettingsContext";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
