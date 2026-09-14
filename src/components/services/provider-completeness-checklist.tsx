import { Card } from "@/components/ui/card";
import type { ProviderCompletion } from "@/lib/api/services";

export function ProviderCompletenessChecklist({
  completion,
  variant = "reality",
}: {
  completion?: ProviderCompletion;
  variant?: "legacy" | "reality";
}) {
  const missing = completion?.missing_fields ?? [];
  const warnings = completion?.warnings ?? [];
  const isReality = variant === "reality";

  return (
    <Card className="p-5" variant={isReality ? "reality" : "legacy"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={
              isReality
                ? "text-xs font-bold uppercase tracking-[0.22em] text-reality-brand-600"
                : "text-xs font-bold uppercase tracking-[0.22em] text-reality-brand-600"
            }
          >
            Profile readiness
          </p>
          <h2
            className={
              isReality
                ? "mt-2 font-display text-2xl font-semibold text-reality-text-primary"
                : "mt-2 font-display text-2xl font-semibold text-reality-text-primary"
            }
          >
            {completion?.is_complete ? "Ready for review" : "Complete your setup"}
          </h2>
        </div>
        <span
          aria-hidden
          className={`grid h-7 w-7 place-items-center rounded-full border text-sm font-bold ${
            completion?.is_complete
              ? isReality
                ? "border-reality-brand-500/20 bg-reality-brand-50 text-reality-brand-700"
                : "border-emerald-200/40 bg-emerald-200/10 text-emerald-100"
              : isReality
                ? "border-amber-300/40 bg-amber-50 text-amber-700"
                : "border-brand-secondary/40 bg-brand-secondary/10 text-reality-brand-600"
          }`}
        >
          {completion?.is_complete ? "✓" : "!"}
        </span>
      </div>

      {missing.length > 0 ? (
        <ul className={isReality ? "mt-4 space-y-2 text-sm text-reality-text-secondary" : "mt-4 space-y-2 text-sm text-reality-text-secondary"}>
          {missing.map((item) => (
            <li className="flex gap-2" key={item}>
              <span className={isReality ? "mt-1 h-1.5 w-1.5 rounded-full bg-reality-brand-500" : "mt-1 h-1.5 w-1.5 rounded-full bg-brand-secondary"} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={isReality ? "mt-4 text-sm leading-6 text-reality-text-secondary" : "mt-4 text-sm leading-6 text-reality-text-secondary"}>
          Core profile, primary trade, and service area requirements are satisfied.
        </p>
      )}

      {warnings.length > 0 ? (
        <div
          className={
            isReality
              ? "mt-4 rounded-[16px] border border-reality-border-secondary bg-reality-bg-subtle p-3 text-sm leading-6 text-reality-text-secondary"
              : "mt-4 rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-3 text-sm leading-6 text-reality-text-secondary"
          }
        >
          {warnings.join(" ")}
        </div>
      ) : null}
    </Card>
  );
}


