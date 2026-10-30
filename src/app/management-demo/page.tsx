import { requireBetaDemoPage } from "@/lib/beta-demo-config";

import { ManagementDemo } from "./management-demo";

export default function ManagementDemoPage() {
  requireBetaDemoPage();
  return <ManagementDemo />;
}
