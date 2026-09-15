"use client";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { Navbar } from "@/components/layout/navbar";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar variant="reality" />
      <div className="min-h-screen bg-reality-canvas [color-scheme:light]">{children}</div>
      <AssistantWidget />
    </>
  );
}

