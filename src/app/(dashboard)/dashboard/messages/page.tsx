"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listThreads } from "@/lib/api/messages";

export default function MessagesInboxPage() {
  const threadsQuery = useQuery({
    queryKey: ["message-threads"],
    queryFn: listThreads,
  });

  const threads = threadsQuery.data ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          description="Conversations with buyers, agents, and property owners."
          title="Messages"
        />

        <section className="mt-6">
          {threadsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading conversations...</p>
          ) : threads.length > 0 ? (
            <div className="grid gap-3">
              {threads.map((thread) => (
                <Link href={`/dashboard/messages/${thread.id}`} key={thread.id}>
                  <Card className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-text">
                        {thread.last_message?.body ?? "No messages yet"}
                      </p>
                      {thread.is_closed && (
                        <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-brand-muted">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">
                      {thread.last_message
                        ? new Date(thread.last_message.created_at).toLocaleString()
                        : new Date(thread.created_at).toLocaleString()}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">No conversations yet.</p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
