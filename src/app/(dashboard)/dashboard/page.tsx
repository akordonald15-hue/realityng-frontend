import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-muted">Role-aware dashboards begin in Sprint 1 and expand later.</p>
      </main>
    </ProtectedRoute>
  );
}
