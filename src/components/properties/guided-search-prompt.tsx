"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { searchWithAssistant } from "@/lib/api/assistant";
import { getApiErrorMessage } from "@/lib/api/errors";

/**
 * Filter keys the backend parser can return, mapped onto the query parameters
 * the marketplace already understands. Anything outside this list is ignored so
 * a parser change can never push unknown state into the URL.
 */
const SUPPORTED_FILTER_KEYS = [
  "city",
  "property_type",
  "listing_type",
  "min_price",
  "max_price",
  "min_bedrooms",
  "min_bathrooms",
] as const;

const EXAMPLE_PROMPTS = [
  "3 bedroom house in Abuja for sale",
  "Short let in Lagos under ₦150,000",
  "Land in Uyo below ₦20 million",
];

export function toSearchParams(extracted: Record<string, unknown> | null | undefined) {
  const params = new URLSearchParams();
  if (!extracted) {
    return params;
  }

  for (const key of SUPPORTED_FILTER_KEYS) {
    const value = extracted[key];
    if (value === null || value === undefined || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  return params;
}

export function GuidedSearchPrompt() {
  const router = useRouter();
  const inputId = useId();
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const search = useMutation({
    mutationFn: searchWithAssistant,
    onSuccess: (data) => {
      const params = toSearchParams(data.extracted_filters);

      if ([...params.keys()].length === 0) {
        setNotice(
          "We could not turn that into filters. Try naming a city, property type, or budget - or use the filters above.",
        );
        return;
      }

      setNotice(null);
      router.push(`/properties?${params.toString()}`);
    },
    onError: (error) => {
      setNotice(getApiErrorMessage(error));
    },
  });

  function submit() {
    const query = prompt.trim();
    if (!query || search.isPending) {
      return;
    }
    setNotice(null);
    search.mutate(query);
  }

  return (
    <section
      aria-labelledby={`${inputId}-label`}
      className="mb-8 rounded-[1.5rem] border border-reality-border-secondary bg-reality-surfaceBrand px-4 py-5 md:px-6 md:py-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          className="text-sm font-semibold text-reality-text-brand md:text-base"
          id={`${inputId}-label`}
        >
          Describe what you are looking for
        </h2>
        <p className="text-xs leading-5 text-reality-text-tertiary md:text-sm">
          We turn your description into the filters above. You can adjust them afterwards.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          autoComplete="off"
          className="h-12 w-full min-w-0 rounded-full border border-reality-border-secondary bg-reality-surface px-5 text-sm text-reality-text-primary outline-none placeholder:text-reality-text-tertiary focus-visible:border-reality-brand-600 focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          id={inputId}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="2 bedroom apartment in Lekki under ₦5 million"
          type="search"
          value={prompt}
        />
        <Button
          className="h-12 shrink-0 rounded-full px-6"
          disabled={!prompt.trim() || search.isPending}
          onClick={submit}
          variant="reality"
        >
          {search.isPending ? "Finding..." : "Find matches"}
        </Button>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <li key={example}>
            <button
              className="rounded-full border border-reality-border-secondary bg-reality-surface px-3 py-1.5 text-xs text-reality-text-secondary transition hover:border-reality-brand-600 hover:text-reality-brandEmphasis focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-reality-brand-600"
              onClick={() => setPrompt(example)}
              type="button"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="sr-only">
        {search.isPending ? "Working out your filters" : ""}
      </p>

      {notice ? (
        <p
          className="mt-3 text-xs leading-5 text-reality-status-pending md:text-sm"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </section>
  );
}
