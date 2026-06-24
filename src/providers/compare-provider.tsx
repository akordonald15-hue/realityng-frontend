"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Property } from "@/lib/api/properties";

const COMPARE_STORAGE_KEY = "realityng.compareProperties";
export const MAX_COMPARE_PROPERTIES = 4;

type CompareContextValue = {
  properties: Property[];
  isSelected: (propertyId: string) => boolean;
  addProperty: (property: Property) => void;
  removeProperty: (propertyId: string) => void;
  clearProperties: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

function readStoredProperties(): Property[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]",
    ) as Property[];
    return stored.slice(0, MAX_COMPARE_PROPERTIES);
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setProperties(readStoredProperties());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      window.sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(properties));
    }
  }, [isHydrated, properties]);

  const isSelected = useCallback(
    (propertyId: string) => properties.some((property) => property.id === propertyId),
    [properties],
  );

  const addProperty = useCallback((property: Property) => {
    setProperties((current) => {
      if (
        current.some((selected) => selected.id === property.id) ||
        current.length >= MAX_COMPARE_PROPERTIES
      ) {
        return current;
      }
      return [...current, property];
    });
  }, []);

  const removeProperty = useCallback((propertyId: string) => {
    setProperties((current) => current.filter((property) => property.id !== propertyId));
  }, []);

  const clearProperties = useCallback(() => setProperties([]), []);

  const value = useMemo(
    () => ({ properties, isSelected, addProperty, removeProperty, clearProperties }),
    [addProperty, clearProperties, isSelected, properties, removeProperty],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider.");
  }
  return context;
}
