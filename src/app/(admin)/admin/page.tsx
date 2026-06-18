import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <Card className="p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">Admin</h1>
        <p className="mt-2 max-w-2xl text-brand-muted">
          Property review operations remain connected to the backend admin workflow.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/dashboard">
            Back to dashboard
          </Link>
          <Link className={buttonClasses("secondary", "w-full sm:w-auto")} href="/properties">
            View public listings
          </Link>
        </div>
      </Card>
    </main>
  );
}
