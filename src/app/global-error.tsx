"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-600">
              Please refresh the page. If the problem continues, try again shortly.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
