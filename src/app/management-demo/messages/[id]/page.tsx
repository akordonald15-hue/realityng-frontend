import Link from "next/link";

import { MessageThreadPageContent } from "@/components/messages/reality-messages";
import { requireBetaDemoPage } from "@/lib/beta-demo-config";

export default function BetaMessagePage() {
  requireBetaDemoPage();
  return <>
    <aside className="sticky top-0 z-50 bg-amber-100 px-4 py-3 font-semibold text-amber-950">
      SYNTHETIC BETA CONVERSATION · <Link href="/management-demo" className="underline">Back to management demo</Link>
    </aside>
    <MessageThreadPageContent />
  </>;
}
