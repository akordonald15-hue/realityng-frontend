"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { createThread } from "@/lib/api/messages";

export function ServiceConversationButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () => createThread({ service_quote: quoteId }),
    onSuccess: (thread) => router.push(`/dashboard/messages/${thread.id}`),
  });
  if (process.env.NEXT_PUBLIC_SERVICE_CONVERSATIONS_ENABLED !== "true") return null;
  return (
    <div className="mt-3">
      <Button
        variant="realitySecondary"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Opening conversation..." : "Message about this request"}
      </Button>
      {mutation.isError ? (
        <FormMessage tone="error">{getApiErrorMessage(mutation.error)}</FormMessage>
      ) : null}
    </div>
  );
}
