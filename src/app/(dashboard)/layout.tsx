import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { AssistantWidget } from "@/components/assistant/assistant-widget";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
      <AssistantWidget />
    </ProtectedRoute>
  );
}
