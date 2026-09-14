import { AuthCard } from "@/components/auth/auth-card";
import { RealityAuthFlow } from "@/components/auth/reality-auth-flow";

export default function SignInPage() {
  return (
    <AuthCard>
      <RealityAuthFlow mode="sign-in" />
    </AuthCard>
  );
}

