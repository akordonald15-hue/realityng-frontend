"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { PropertyImageManager } from "@/components/properties/property-image-manager";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createProperty,
  propertyTypeOptions,
  submitPropertyForReview,
  updateProperty,
  type ListingType,
  type Property,
  type PropertyPayload,
  type PropertyType,
} from "@/lib/api/properties";
import { formatListingType, formatPrice, formatPropertyType } from "@/lib/properties/format";

const propertyFormSchema = z
  .object({
    title: z.string().min(5, "Enter a descriptive title."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    property_type: z.enum([
      "apartment",
      "house",
      "land",
      "commercial",
      "office",
      "shop",
      "warehouse",
      "mixed_use",
    ]),
    listing_type: z.enum(["sale", "rent", "apartment_share"]),
    price: z.coerce.number().positive("Price must be greater than zero."),
    currency: z.string().length(3, "Use a 3-letter currency code."),
    country: z.string().min(1, "Country is required."),
    state: z.string().min(1, "State is required."),
    city: z.string().min(1, "City is required."),
    lga: z.string().optional(),
    neighborhood: z.string().optional(),
    landmark: z.string().optional(),
    address: z.string().min(1, "Address is required."),
    bedrooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    bathrooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    parking_spaces: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    land_size: z.coerce.number().positive().optional().or(z.literal("")),
    floor_area: z.coerce.number().positive().optional().or(z.literal("")),
    location_precision: z.enum(["exact", "neighborhood", "city", "hidden"]),
    show_exact_location: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.listing_type === "apartment_share" && values.property_type !== "apartment") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Apartment share listings must use the apartment property type.",
        path: ["property_type"],
      });
    }
    if (values.property_type === "land" && !values.land_size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Land listings require land size.",
        path: ["land_size"],
      });
    }
    if (values.property_type !== "land" && !values.floor_area) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Built property listings require floor area.",
        path: ["floor_area"],
      });
    }
    if (values.show_exact_location && values.location_precision !== "exact") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exact location can only be shown when location precision is exact.",
        path: ["location_precision"],
      });
    }
  });

type PropertyFormValues = z.infer<typeof propertyFormSchema>;
type Step = "details" | "location" | "features" | "media" | "review";

const steps: Array<{ id: Step; label: string }> = [
  { id: "details", label: "Details" },
  { id: "location", label: "Location" },
  { id: "features", label: "Features" },
  { id: "media", label: "Media" },
  { id: "review", label: "Review" },
];

const listingTypeOptions: Array<{ label: string; value: ListingType }> = [
  { label: "Rent", value: "rent" },
  { label: "Sale", value: "sale" },
  { label: "Apartment share", value: "apartment_share" },
];
const supportedCreatePropertyTypes = [
  "apartment",
  "house",
  "land",
  "commercial",
  "office",
  "shop",
  "warehouse",
  "mixed_use",
] as const;
type SupportedCreatePropertyType = (typeof supportedCreatePropertyTypes)[number];

function supportedPropertyType(value?: PropertyType): SupportedCreatePropertyType {
  return value && supportedCreatePropertyTypes.includes(value as SupportedCreatePropertyType)
    ? (value as SupportedCreatePropertyType)
    : "apartment";
}

function numberOrNull(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : value;
}

function decimalOrNull(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : String(value);
}

function defaults(property?: Property): PropertyFormValues {
  return {
    title: property?.title ?? "",
    description: property?.description ?? "",
    property_type: supportedPropertyType(property?.property_type),
    listing_type: property?.listing_type ?? "rent",
    price: property?.price ? Number(property.price) : 0,
    currency: property?.currency ?? "NGN",
    country: property?.country ?? "Nigeria",
    state: property?.state ?? "",
    city: property?.city ?? "",
    lga: property?.lga ?? "",
    neighborhood: property?.neighborhood ?? "",
    landmark: property?.landmark ?? "",
    address: property?.address ?? "",
    bedrooms: property?.bedrooms ?? "",
    bathrooms: property?.bathrooms ?? "",
    parking_spaces: property?.parking_spaces ?? "",
    land_size: property?.land_size ? Number(property.land_size) : "",
    floor_area: property?.floor_area ? Number(property.floor_area) : "",
    location_precision: property?.location_precision ?? "neighborhood",
    show_exact_location: property?.location_precision === "exact" && !property.approximate_location,
  };
}

function toPayload(values: PropertyFormValues): PropertyPayload {
  return {
    ...values,
    price: String(values.price),
    bedrooms: numberOrNull(values.bedrooms),
    bathrooms: numberOrNull(values.bathrooms),
    parking_spaces: numberOrNull(values.parking_spaces),
    land_size: decimalOrNull(values.land_size),
    floor_area: decimalOrNull(values.floor_area),
    lga: values.lga?.trim() || undefined,
    neighborhood: values.neighborhood?.trim() || undefined,
    landmark: values.landmark?.trim() || undefined,
  };
}

function validateStepValues(values: PropertyFormValues, step: Step) {
  const issues: Array<{ field: keyof PropertyFormValues; message: string }> = [];
  if (step === "details") {
    if (values.title.trim().length < 5) {
      issues.push({ field: "title", message: "Enter a descriptive title." });
    }
    if (values.description.trim().length < 20) {
      issues.push({ field: "description", message: "Description must be at least 20 characters." });
    }
    if (!values.price || Number(values.price) <= 0) {
      issues.push({ field: "price", message: "Price must be greater than zero." });
    }
    if (values.currency.trim().length !== 3) {
      issues.push({ field: "currency", message: "Use a 3-letter currency code." });
    }
    if (values.listing_type === "apartment_share" && values.property_type !== "apartment") {
      issues.push({
        field: "property_type",
        message: "Apartment share listings must use the apartment property type.",
      });
    }
  }
  if (step === "location") {
    (["country", "state", "city", "address"] as const).forEach((field) => {
      if (!String(values[field] || "").trim()) {
        issues.push({ field, message: `${field[0].toUpperCase()}${field.slice(1)} is required.` });
      }
    });
  }
  if (step === "features") {
    const result = propertyFormSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        issues.push({
          field: issue.path[0] as keyof PropertyFormValues,
          message: issue.message,
        });
      });
    }
  }
  return issues;
}

function CounterField({
  label,
  name,
  setValue,
  value,
}: {
  label: string;
  name: "bedrooms" | "bathrooms" | "parking_spaces";
  setValue: (name: "bedrooms" | "bathrooms" | "parking_spaces", value: number) => void;
  value: number | "";
}) {
  const numericValue = value === "" ? 0 : value;
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-reality-border-secondary bg-white p-4">
      <span className="text-sm font-semibold text-reality-text-primary">{label}</span>
      <div className="flex items-center gap-3">
        <button
          aria-label={`Decrease ${label}`}
          className="h-10 w-10 rounded-full border border-reality-border-secondary text-lg font-semibold text-reality-text-secondary transition hover:bg-reality-bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          onClick={() => setValue(name, Math.max(numericValue - 1, 0))}
          type="button"
        >
          -
        </button>
        <span className="w-8 text-center text-base font-semibold text-reality-text-primary">
          {numericValue}
        </span>
        <button
          aria-label={`Increase ${label}`}
          className="h-10 w-10 rounded-full bg-reality-brand-500 text-lg font-semibold text-white transition hover:bg-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          onClick={() => setValue(name, numericValue + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PropertyForm({
  initialProperty,
  mode,
}: {
  initialProperty?: Property;
  mode: "create" | "edit";
}) {
  const [step, setStep] = useState<Step>("details");
  const [maxUnlockedStepIndex, setMaxUnlockedStepIndex] = useState(
    mode === "edit" ? steps.length - 1 : 0,
  );
  const [savedProperty, setSavedProperty] = useState<Property | null>(initialProperty ?? null);
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: defaults(initialProperty),
  });
  const values = watch();
  const previewProperty = useMemo(
    () =>
      ({
        ...(savedProperty ?? initialProperty),
        ...toPayload(values),
        id: savedProperty?.id ?? initialProperty?.id ?? "preview",
        slug: savedProperty?.slug ?? initialProperty?.slug ?? "",
        status: savedProperty?.status ?? initialProperty?.status ?? "draft",
        featured: initialProperty?.featured ?? false,
        created_at: savedProperty?.created_at ?? initialProperty?.created_at ?? new Date().toISOString(),
      }) as Property,
    [initialProperty, savedProperty, values],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: PropertyPayload) =>
      savedProperty ? updateProperty(savedProperty.slug, payload) : createProperty(payload),
    onSuccess: (property) => {
      setSavedProperty(property);
      setServerError("");
      setSuccess(`${property.title} saved as a draft.`);
      setMaxUnlockedStepIndex((index) =>
        Math.max(index, steps.findIndex((item) => item.id === "media")),
      );
      setStep("media");
    },
    onError: (error) => {
      setSuccess("");
      setServerError(getApiErrorMessage(error));
    },
  });
  const submitMutation = useMutation({
    mutationFn: () => submitPropertyForReview((savedProperty ?? initialProperty)?.slug ?? ""),
    onSuccess: (property) => {
      setSavedProperty(property);
      setServerError("");
      setSuccess(`${property.title} submitted for review.`);
    },
    onError: (error) => setServerError(getApiErrorMessage(error)),
  });

  async function validateStep(nextStep: Step) {
    const issues = validateStepValues(getValues(), step);
    if (issues.length > 0) {
      issues.forEach((issue) => {
        setError(issue.field, { message: issue.message, type: "manual" });
      });
      return;
    }
    const nextIndex = steps.findIndex((item) => item.id === nextStep);
    setMaxUnlockedStepIndex((index) => Math.max(index, nextIndex));
    setStep(nextStep);
  }

  function saveDraft(valuesToSave: PropertyFormValues) {
    saveMutation.mutate(toPayload(valuesToSave));
  }

  function submitForReview() {
    if (!savedProperty && !initialProperty) {
      setServerError("Save the draft before submitting for review.");
      return;
    }
    submitMutation.mutate();
  }

  return (
    <main className="min-h-screen bg-reality-canvas pb-20 pt-8 text-reality-text-primary [color-scheme:light] lg:pt-10">
      <div className="mx-auto w-full max-w-reality px-5 sm:px-6 lg:px-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-reality-text-tertiary">
            <Link className="transition hover:text-reality-brand-700" href="/dashboard">
              Dashboard
            </Link>
            <span>/</span>
            <Link className="transition hover:text-reality-brand-700" href="/dashboard/properties">
              My Properties
            </Link>
            <span>/</span>
            <span aria-current="page" className="text-reality-text-secondary">
              {mode === "edit" ? "Edit Property" : "New Property"}
            </span>
          </nav>
          <Link className={buttonClasses("realitySecondary", "h-10 px-5")} href="/dashboard/properties">
            View properties
          </Link>
        </div>

        <header className="mt-8">
          <h1 className="text-4xl font-medium leading-[44px] text-reality-text-primary">
            {mode === "edit" ? "Edit Property" : "New Property"}
          </h1>
          <p className="mt-2 max-w-2xl text-lg leading-7 text-reality-text-secondary">
            Add the listing details, media, and review everything before submitting to RealityNG.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.12em] text-reality-text-tertiary lg:block">Listing progress</p>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-4 lg:overflow-visible">
              {steps.map((item, index) => (
                <button
                  aria-current={step === item.id ? "step" : undefined}
                  aria-disabled={index > maxUnlockedStepIndex}
                  className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 lg:w-full lg:text-left ${
                    step === item.id
                      ? "bg-reality-brand-500 text-white shadow-reality-xs"
                      : index > maxUnlockedStepIndex
                        ? "cursor-not-allowed bg-reality-surfaceMuted text-reality-text-quaternary opacity-60"
                      : "bg-reality-surface text-reality-text-secondary hover:bg-reality-surfaceBrand"
                  }`}
                  disabled={index > maxUnlockedStepIndex}
                  key={item.id}
                  onClick={() => setStep(item.id)}
                  type="button"
                >
                  {index + 1}. {item.label}
                </button>
              ))}
            </div>
          </aside>

          <form className="grid gap-6" onSubmit={handleSubmit(saveDraft)}>
            <FormMessage tone="error" variant="reality">
              {serverError}
            </FormMessage>
            <FormMessage tone="success" variant="reality">
              {success}
            </FormMessage>

            {step === "details" ? (
              <Card className="grid gap-5 rounded-[28px] p-5 sm:p-7" variant="realityElevated">
                <h2 className="text-2xl font-semibold">Property details</h2>
                <p className="-mt-3 text-sm text-reality-text-secondary">Start with the essentials buyers will use to understand this listing.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-reality-text-primary" htmlFor="property_type">
                    <span>Property type</span>
                    <Select className="mt-2" id="property_type" variant="reality" {...register("property_type")}>
                      {propertyTypeOptions
                        .filter((option) =>
                          ["apartment", "house", "land", "commercial", "office", "shop", "warehouse", "mixed_use"].includes(option.value),
                        )
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </Select>
                    {errors.property_type ? <span className="mt-1 block text-sm text-red-600">{errors.property_type.message}</span> : null}
                  </label>
                  <label className="block text-sm font-medium text-reality-text-primary" htmlFor="listing_type">
                    <span>Listing type</span>
                    <Select className="mt-2" id="listing_type" variant="reality" {...register("listing_type")}>
                      {listingTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {errors.listing_type ? <span className="mt-1 block text-sm text-red-600">{errors.listing_type.message}</span> : null}
                  </label>
                </div>
                <TextField error={errors.title} label="Title" variant="reality" {...register("title")} />
                <label className="block text-sm font-medium text-reality-text-primary" htmlFor="description">
                  <span>Description</span>
                  <textarea
                    className="mt-2 min-h-32 w-full rounded-[16px] border border-reality-border-secondary bg-white px-4 py-3 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-quaternary focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                    id="description"
                    placeholder="Describe the property, neighborhood, and what makes it useful."
                    {...register("description")}
                  />
                  {errors.description ? <span className="mt-1 block text-sm text-red-600">{errors.description.message}</span> : null}
                </label>
                <div className="grid gap-4 rounded-[20px] bg-reality-surfaceMuted p-4 sm:grid-cols-2" aria-label="Pricing">
                  <TextField error={errors.price} label="Price" min="1" type="number" variant="reality" {...register("price")} />
                  <TextField error={errors.currency} label="Currency" variant="reality" {...register("currency")} />
                </div>
              </Card>
            ) : null}

            {step === "location" ? (
              <Card className="grid gap-5 rounded-[28px] p-5 sm:p-7" variant="realityElevated">
                <h2 className="text-2xl font-semibold">Location</h2>
                <p className="-mt-3 text-sm text-reality-text-secondary">Provide the searchable area first, then the exact address and map visibility.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField error={errors.country} label="Country" variant="reality" {...register("country")} />
                  <TextField error={errors.state} label="State" variant="reality" {...register("state")} />
                  <TextField error={errors.city} label="City" variant="reality" {...register("city")} />
                  <TextField label="LGA" variant="reality" {...register("lga")} />
                  <TextField label="Neighborhood" variant="reality" {...register("neighborhood")} />
                  <TextField label="Landmark" variant="reality" {...register("landmark")} />
                </div>
                <TextField error={errors.address} label="Address" variant="reality" {...register("address")} />
                <label className="block text-sm font-medium text-reality-text-primary" htmlFor="location_precision">
                  <span>Map privacy</span>
                  <Select className="mt-2" id="location_precision" variant="reality" {...register("location_precision")}>
                    <option value="neighborhood">Neighborhood approximate</option>
                    <option value="city">City only</option>
                    <option value="exact">Exact location</option>
                    <option value="hidden">Hidden</option>
                  </Select>
                </label>
              </Card>
            ) : null}

            {step === "features" ? (
              <Card className="grid gap-5 rounded-[28px] p-5 sm:p-7" variant="realityElevated">
                <h2 className="text-2xl font-semibold">Features</h2>
                <p className="-mt-3 text-sm text-reality-text-secondary">Describe the spaces and dimensions relevant to this property.</p>
                <CounterField label="Bedrooms" name="bedrooms" setValue={setValue} value={values.bedrooms ?? ""} />
                <CounterField label="Bathrooms" name="bathrooms" setValue={setValue} value={values.bathrooms ?? ""} />
                <CounterField label="Parking spaces" name="parking_spaces" setValue={setValue} value={values.parking_spaces ?? ""} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField error={errors.land_size} label="Land size sqm" min="1" type="number" variant="reality" {...register("land_size")} />
                  <TextField error={errors.floor_area} label="Floor area sqm" min="1" type="number" variant="reality" {...register("floor_area")} />
                </div>
              </Card>
            ) : null}

            {step === "media" ? (
              <Card className="rounded-[28px] p-5 sm:p-7" variant="realityElevated">
                <h2 className="text-2xl font-semibold">Media</h2>
                <p className="mt-2 text-sm text-reality-text-secondary">
                  Save the draft first, then upload JPEG, PNG, or WebP images. The first image becomes the cover automatically.
                </p>
                {savedProperty ? (
                  <div className="mt-6">
                    <PropertyImageManager propertySlug={savedProperty.slug} variant="reality" />
                  </div>
                ) : (
                  <FormMessage tone="info" variant="reality">
                    Save this property as a draft before uploading media.
                  </FormMessage>
                )}
              </Card>
            ) : null}

            {step === "review" ? (
              <Card className="rounded-[28px] border-reality-brand-300 bg-reality-surfaceBrand p-5 sm:p-7" variant="realityElevated">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Review listing</h2>
                    <p className="mt-2 text-sm text-reality-text-secondary">
                      Confirm the saved details before submitting for RealityNG review.
                    </p>
                  </div>
                  <StatusChip tone={savedProperty?.status === "pending_review" ? "pending" : "neutral"}>
                    {savedProperty?.status === "pending_review" ? "Pending review" : "Draft"}
                  </StatusChip>
                </div>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Title", previewProperty.title || "Not supplied"],
                    ["Type", formatPropertyType(previewProperty.property_type as PropertyType)],
                    ["Listing", formatListingType(previewProperty.listing_type as ListingType)],
                    ["Price", formatPrice(previewProperty)],
                    ["Location", [previewProperty.city, previewProperty.state].filter(Boolean).join(", ") || "Not supplied"],
                    ["Size", previewProperty.property_type === "land" ? `${previewProperty.land_size ?? "-"} sqm` : `${previewProperty.floor_area ?? "-"} sqm`],
                  ].map(([label, value]) => (
                    <div className="rounded-[20px] border border-reality-border-secondary bg-reality-surface p-4" key={label}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-tertiary">{label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-reality-text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ) : null}

            <Card className="flex flex-col gap-3 rounded-[24px] border-reality-border-secondary bg-reality-surface p-4 shadow-reality-sm sm:flex-row sm:justify-between" variant="realityElevated">
              <Button
                disabled={step === "details"}
                onClick={() => {
                  const currentIndex = steps.findIndex((item) => item.id === step);
                  setStep(steps[Math.max(currentIndex - 1, 0)].id);
                }}
                variant="realitySecondary"
              >
                Back
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button disabled={saveMutation.isPending} type="submit" variant="realitySecondary">
                  {saveMutation.isPending ? "Saving..." : savedProperty ? "Save changes" : "Save draft"}
                </Button>
                {step === "review" ? (
                  <Button
                    disabled={!savedProperty || submitMutation.isPending}
                    onClick={submitForReview}
                    variant="reality"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit for review"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const currentIndex = steps.findIndex((item) => item.id === step);
                      void validateStep(steps[Math.min(currentIndex + 1, steps.length - 1)].id);
                    }}
                    variant="reality"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </Card>
          </form>
        </div>
      </div>
    </main>
  );
}

