import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardChrome } from "@/components/layout/dashboard-chrome";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute>
      <DashboardChrome>{children}</DashboardChrome>
    </ProtectedRoute>
  );
}

