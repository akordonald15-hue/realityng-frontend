import { Card } from "@/components/ui/card";
import type { ProviderCompletion } from "@/lib/api/services";

export function ProviderCompletenessChecklist({
  completion,
}: {
  completion?: ProviderCompletion;
}) {
  const missing = completion?.missing_fields ?? [];
  const warnings = completion?.warnings ?? [];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">
            Profile readiness
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-text">
            {completion?.is_complete ? "Ready for review" : "Complete your setup"}
          </h2>
        </div>
        <span
          aria-hidden
          className={`grid h-7 w-7 place-items-center rounded-full border text-sm font-bold ${
            completion?.is_complete
              ? "border-emerald-200/40 bg-emerald-200/10 text-emerald-100"
              : "border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary"
          }`}
        >
          {completion?.is_complete ? "✓" : "!"}
        </span>
      </div>

      {missing.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-brand-muted">
          {missing.map((item) => (
            <li className="flex gap-2" key={item}>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-secondary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-brand-muted">
          Core profile, primary trade, and service area requirements are satisfied.
        </p>
      )}

      {warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-6 text-brand-muted">
          {warnings.join(" ")}
        </div>
      ) : null}
    </Card>
  );
}
