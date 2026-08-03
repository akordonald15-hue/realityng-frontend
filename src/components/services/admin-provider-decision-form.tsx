"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  adminApproveProvider,
  adminReactivateProvider,
  adminRejectProvider,
  adminRequestProviderInfo,
  adminSuspendProvider,
  type OwnerServiceProvider,
} from "@/lib/api/services";

type Action = "approve" | "reject" | "request-info" | "suspend" | "reactivate";

export function AdminProviderDecisionForm({ provider }: { provider: OwnerServiceProvider }) {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<Action>("approve");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const reason = String(form.get("reason") ?? "").trim();
      const note = String(form.get("review_notes") ?? "").trim();
      if (activeAction === "approve") return adminApproveProvider(provider.id);
      if (activeAction === "reactivate") return adminReactivateProvider(provider.id);
      if (activeAction === "reject") {
        return adminRejectProvider(provider.id, { reason, review_notes: note });
      }
      if (activeAction === "request-info") {
        return adminRequestProviderInfo(provider.id, { message: reason, review_notes: note });
      }
      return adminSuspendProvider(provider.id, { reason, review_notes: note });
    },
    onSuccess: (data) => {
      setMessage("Provider moderation action completed.");
      queryClient.setQueryData(["admin-service-provider", provider.id], data);
      queryClient.invalidateQueries({ queryKey: ["admin-service-providers"] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2">
        {(["approve", "reject", "request-info", "suspend", "reactivate"] as Action[]).map(
          (action) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                activeAction === action
                  ? "border-brand-secondary bg-brand-secondary text-brand-background"
                  : "border-white/10 bg-white/5 text-brand-muted hover:border-brand-secondary"
              }`}
              key={action}
              onClick={() => setActiveAction(action)}
              type="button"
            >
              {action.replace("-", " ")}
            </button>
          ),
        )}
      </div>
      <label className="grid gap-2 text-sm font-semibold text-brand-text">
        Reason or message
        <textarea
          className="min-h-24 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
          name="reason"
          placeholder="Required for reject, request info, and suspend."
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-brand-text">
        Private review notes
        <textarea
          className="min-h-20 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
          name="review_notes"
        />
      </label>
      {message ? <FormMessage>{message}</FormMessage> : null}
      <Button disabled={mutation.isPending} type="submit">
        {mutation.isPending ? "Saving..." : "Apply moderation action"}
      </Button>
    </form>
  );
}
