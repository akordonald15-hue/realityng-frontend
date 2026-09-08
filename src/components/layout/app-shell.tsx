import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navbar } from "@/components/layout/navbar";

type AppShellProps = {
  children: React.ReactNode;
  variant?: "legacy" | "reality";
  withAssistant?: boolean;
};

export function AppShell({ children, variant = "legacy", withAssistant = true }: AppShellProps) {
  return (
    <ProtectedRoute>
      <div className={variant === "reality" ? "[color-scheme:light]" : undefined}>
        <Navbar variant={variant} />
        {children}
        {withAssistant ? <AssistantWidget /> : null}
      </div>
    </ProtectedRoute>
  );
}
