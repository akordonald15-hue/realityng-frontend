"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { AccountSettingsShell } from "@/components/settings/account-settings-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <AccountSettingsShell
        description="Choose how RealityNG should notify you about leads, viewings, applications, and messages."
        title="Account Settings"
      >
        <section className="max-w-3xl" aria-labelledby="notification-preferences-heading">
          <h2
            className="text-xl font-semibold text-reality-text-primary"
            id="notification-preferences-heading"
          >
            Notification preferences
          </h2>
          <p className="mt-2 text-sm text-reality-text-secondary">
            These preferences use the existing notification settings API and apply to your
            authenticated account.
          </p>

          <Card className="mt-8 divide-y divide-reality-border-secondary p-2" variant="reality">
          {preferencesQuery.isLoading ? (
            <p className="p-4 text-sm text-reality-text-secondary">Loading preferences...</p>
          ) : preferences ? (
            preferenceRows.map((row) => (
              <div
                className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={row.key}
              >
                <div>
                  <p className="text-sm font-semibold text-reality-text-primary">{row.label}</p>
                  <p className="mt-1 text-sm text-reality-text-secondary">{row.description}</p>
                </div>
                <Button
                  aria-pressed={preferences[row.key]}
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      [row.key]: !preferences[row.key],
                    })
                  }
                  variant={preferences[row.key] ? "reality" : "realitySecondary"}
                >
                  {preferences[row.key] ? "On" : "Off"}
                </Button>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-reality-text-secondary">
              Preferences could not be loaded right now.
            </p>
          )}
          </Card>
          {mutation.isError ? (
            <FormMessage className="mt-4" tone="error" variant="reality">
              Preferences could not be updated. Please try again.
            </FormMessage>
          ) : null}
        </section>
      </AccountSettingsShell>
    </ProtectedRoute>
  );
}

