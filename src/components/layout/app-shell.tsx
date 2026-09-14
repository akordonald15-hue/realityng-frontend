import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navbar } from "@/components/layout/navbar";

type AppShellProps = {
  children: React.ReactNode;
  variant?: "reality";
  withAssistant?: boolean;
};

export function AppShell({ children, variant = "reality", withAssistant = true }: AppShellProps) {
  return (
    <ProtectedRoute>
      <div className="[color-scheme:light]">
        <Navbar variant={variant} />
        {children}
        {withAssistant ? <AssistantWidget /> : null}
      </div>
    </ProtectedRoute>
  );
}

