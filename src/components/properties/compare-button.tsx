"use client";

import { useState } from "react";

import { useRoleSelection } from "@/components/auth/role-selection-modal";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/api/properties";
import { getAccessToken } from "@/lib/auth/token-storage";
import { useOptionalAuth } from "@/providers/auth-provider";
import { MAX_COMPARE_PROPERTIES, useCompare } from "@/providers/compare-provider";

type CompareButtonProps = {
  property: Property;
  compact?: boolean;
  className?: string;
};

export function CompareButton({ property, compact = false, className }: CompareButtonProps) {
  const auth = useOptionalAuth();
  const { addProperty, isSelected, properties, removeProperty } = useCompare();
  const { openRoleSelection } = useRoleSelection();
  const [limitMessage, setLimitMessage] = useState("");
  const selected = isSelected(property.id);

  function toggle() {
    setLimitMessage("");
    if (!auth?.isAuthenticated && !getAccessToken()) {
      openRoleSelection({
        actionLabel: "Compare property",
        nextPath: `${window.location.pathname}${window.location.search}`,
      });
      return;
    }
    if (selected) {
      removeProperty(property.id);
      return;
    }
    if (properties.length >= MAX_COMPARE_PROPERTIES) {
      setLimitMessage(`You can compare up to ${MAX_COMPARE_PROPERTIES} properties.`);
      return;
    }
    addProperty(property);
  }

  const label = selected ? "Remove from comparison" : "Add to comparison";

  return (
    <div className={className}>
      <Button
        aria-label={`${label}: ${property.title}`}
        aria-pressed={selected}
        className={compact ? "h-9 px-3" : "w-full"}
        disabled={!selected && properties.length >= MAX_COMPARE_PROPERTIES}
        onClick={toggle}
        type="button"
        variant={selected ? "primary" : "secondary"}
      >
        {selected ? "Selected" : "Compare"}
      </Button>
      {limitMessage ? (
        <p className="mt-2 text-xs text-brand-secondary" role="status">
          {limitMessage}
        </p>
      ) : null}
    </div>
  );
}
