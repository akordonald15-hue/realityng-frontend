import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import type { ToolResult } from "@/lib/api/assistant";

function SearchResultsCard({
  result,
}: {
  result: Extract<ToolResult, { tool: "search_properties" }>["result"];
}) {
  if (result.result_count === 0) {
    return <p className="text-sm text-brand-muted">No matching properties found.</p>;
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {result.results.map((property) => (
        <div key={property.id} className="w-64 shrink-0">
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}

function CompareResultsCard({
  result,
}: {
  result: Extract<ToolResult, { tool: "compare_properties" }>["result"];
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {result.properties.map((property) => (
          <div key={property.id} className="w-64 shrink-0">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
      {result.missing_property_ids.length > 0 && (
        <p className="text-xs text-brand-muted">
          {result.missing_property_ids.length}{" "}
          {result.missing_property_ids.length === 1 ? "property" : "properties"} could
          not be found or are no longer approved.
        </p>
      )}
    </div>
  );
}

function NavigateResultCard({
  result,
}: {
  result: Extract<ToolResult, { tool: "navigate" }>["result"];
}) {
  if (!result.path) {
    return null;
  }
  return (
    <Link
      href={result.path}
      className="inline-block rounded-md border border-brand-secondary/70 bg-transparent px-3 py-1.5 text-xs text-brand-secondary transition hover:bg-brand-secondary/10"
    >
      View {result.target.replace(/_/g, " ")}
    </Link>
  );
}

export function ToolResultCards({ toolResults }: { toolResults: ToolResult[] }) {
  return (
    <div className="mt-2 space-y-2">
      {toolResults.map((tr) => {
        switch (tr.tool) {
          case "search_properties":
            return <SearchResultsCard key={tr.tool_use_id} result={tr.result} />;
          case "compare_properties":
            return <CompareResultsCard key={tr.tool_use_id} result={tr.result} />;
          case "navigate":
            return <NavigateResultCard key={tr.tool_use_id} result={tr.result} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
