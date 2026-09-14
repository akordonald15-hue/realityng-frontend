import { AuthCard } from "@/components/auth/auth-card";
import { RealityAuthFlow } from "@/components/auth/reality-auth-flow";

export default function SignUpPage() {
  return (
    <AuthCard showLogomark>
      <RealityAuthFlow mode="sign-up" />
    </AuthCard>
  );
}

