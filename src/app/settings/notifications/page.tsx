"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreference,
} from "@/lib/api/notifications";

const preferenceRows: Array<{
  key: keyof Pick<
    NotificationPreference,
    | "in_app_enabled"
    | "email_enabled"
    | "lead_notifications"
    | "viewing_notifications"
    | "application_notifications"
    | "message_notifications"
  >;
  label: string;
  description: string;
}> = [
  {
    key: "in_app_enabled",
    label: "In-app notifications",
    description: "Show alerts in RealityNG when important activity happens.",
  },
  {
    key: "email_enabled",
    label: "Email notifications",
    description: "Allow transactional email hooks for supported notification types.",
  },
  {
    key: "lead_notifications",
    label: "Lead updates",
    description: "Assignment, pipeline, and follow-up updates from your leads.",
  },
  {
    key: "viewing_notifications",
    label: "Viewing updates",
    description: "Viewing requests, confirmations, reschedules, and cancellations.",
  },
  {
    key: "application_notifications",
    label: "Application updates",
    description: "Rental application submissions and status changes.",
  },
  {
    key: "message_notifications",
    label: "Message alerts",
    description: "New conversation messages from buyers, owners, and agents.",
  },
];

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const preferencesQuery = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
  });
  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(["notification-preferences"], preferences);
    },
  });

  const preferences = preferencesQuery.data;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          description="Choose how RealityNG should notify you about leads, viewings, applications, and messages."
          title="Notification preferences"
        />

        <Card className="mt-6 divide-y divide-white/10 p-2">
          {preferencesQuery.isLoading ? (
            <p className="p-4 text-sm text-brand-muted">Loading preferences...</p>
          ) : preferences ? (
            preferenceRows.map((row) => (
              <div
                className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={row.key}
              >
                <div>
                  <p className="text-sm font-semibold text-brand-text">{row.label}</p>
                  <p className="mt-1 text-sm text-brand-muted">{row.description}</p>
                </div>
                <Button
                  aria-pressed={preferences[row.key]}
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      [row.key]: !preferences[row.key],
                    })
                  }
                  variant={preferences[row.key] ? "primary" : "secondary"}
                >
                  {preferences[row.key] ? "On" : "Off"}
                </Button>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-brand-muted">
              Preferences could not be loaded right now.
            </p>
          )}
        </Card>
      </main>
    </ProtectedRoute>
  );
}
