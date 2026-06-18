"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { PropertyImageManager } from "@/components/properties/property-image-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { createProperty, propertyTypeOptions, type Property } from "@/lib/api/properties";
import { Select } from "@/components/ui/select";

const basicStepSchema = z.object({
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
  listing_type: z.enum(["sale", "rent"]),
  price: z.coerce.number().positive("Price must be greater than zero."),
  currency: z.string().length(3, "Use a 3-letter currency code."),
});

const propertySchema = z
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
    listing_type: z.enum(["sale", "rent"]),
    price: z.coerce.number().positive("Price must be greater than zero."),
    currency: z.string().length(3, "Use a 3-letter currency code."),
    country: z.string().min(1, "Country is required."),
    state: z.string().min(1, "State is required."),
    city: z.string().min(1, "City is required."),
    address: z.string().min(1, "Address is required."),
    bedrooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    bathrooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    parking_spaces: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    land_size: z.coerce.number().positive().optional().or(z.literal("")),
    floor_area: z.coerce.number().positive().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
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
  });

type PropertyFormValues = z.infer<typeof propertySchema>;
type Step = "basic" | "location" | "media";

function optionalNumber(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : value;
}

function optionalDecimal(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : String(value);
}

function stepLabel(step: Step) {
  return {
    basic: "Basic details",
    location: "Location",
    media: "Media upload",
  }[step];
}

export default function NewPropertyPage() {
  const [step, setStep] = useState<Step>("basic");
  const [savedProperty, setSavedProperty] = useState<Property | null>(null);
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "apartment",
      listing_type: "rent",
      currency: "NGN",
      country: "Nigeria",
      state: "",
      city: "",
      address: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (property) => {
      setServerError("");
      setSuccess(`${property.title} saved as a draft.`);
      setSavedProperty(property);
      setStep("media");
    },
    onError: (error) => {
      setSuccess("");
      setServerError(getApiErrorMessage(error));
    },
  });

  function goToLocation() {
    const result = basicStepSchema.safeParse(getValues());
    if (result.success) {
      clearErrors();
      setStep("location");
      return;
    }
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof PropertyFormValues;
      setError(field, { message: issue.message, type: "manual" });
    });
  }

  function onSubmit(values: PropertyFormValues) {
    mutation.mutate({
      ...values,
      price: String(values.price),
      bedrooms: optionalNumber(values.bedrooms),
      bathrooms: optionalNumber(values.bathrooms),
      parking_spaces: optionalNumber(values.parking_spaces),
      land_size: optionalDecimal(values.land_size),
      floor_area: optionalDecimal(values.floor_area),
    });
  }

  const selectClass =
    "mt-2";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-brand-background px-6 py-8 text-brand-text">
        <div className="mx-auto max-w-5xl border-b border-white/10 pb-6">
          <h1 className="font-heading text-4xl font-semibold text-brand-text">Add a property</h1>
          <p className="mt-2 text-brand-muted">{stepLabel(step)}</p>
        </div>
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-3 gap-2 text-sm font-medium">
          {(["basic", "location", "media"] as Step[]).map((item) => (
            <div
              className={
                item === step
                  ? "rounded-sm bg-brand-secondary px-3 py-2 text-center text-brand-background"
                  : "rounded-sm bg-white/5 px-3 py-2 text-center text-brand-muted"
              }
              key={item}
            >
              {stepLabel(item)}
            </div>
          ))}
        </div>

        {step === "media" && savedProperty ? (
          <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
            <PropertyImageManager propertySlug={savedProperty.slug} />
            <Card className="h-fit p-4">
              <FormMessage tone="success">{success}</FormMessage>
              <p className="mt-3 text-sm text-brand-muted">
                Upload up to 30 JPEG, PNG, or WebP images. The first image becomes the cover
                automatically.
              </p>
              <Button className="mt-4 w-full" onClick={() => setStep("location")} variant="secondary">
                Edit details
              </Button>
            </Card>
          </div>
        ) : (
          <form
            className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <section className="space-y-5">
              {step === "basic" ? (
                <>
                  <TextField label="Title" error={errors.title} {...register("title")} />
                  <label className="block text-sm font-medium text-brand-text" htmlFor="description">
                    <span>Description</span>
                    <textarea
                      className="mt-2 min-h-32 w-full rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                      id="description"
                      {...register("description")}
                    />
                    {errors.description ? (
                      <span className="mt-1 block text-sm text-red-300">
                        {errors.description.message}
                      </span>
                    ) : null}
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-brand-text" htmlFor="property_type">
                      <span>Property type</span>
                      <Select className={selectClass} id="property_type" {...register("property_type")}>
                        {propertyTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="block text-sm font-medium text-brand-text" htmlFor="listing_type">
                      <span>Listing type</span>
                      <Select className={selectClass} id="listing_type" {...register("listing_type")}>
                        <option value="rent">Rent</option>
                        <option value="sale">Sale</option>
                      </Select>
                    </label>
                    <TextField
                      label="Price"
                      error={errors.price}
                      min="1"
                      type="number"
                      {...register("price")}
                    />
                    <TextField label="Currency" error={errors.currency} {...register("currency")} />
                  </div>
                </>
              ) : null}

              {step === "location" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Country" error={errors.country} {...register("country")} />
                    <TextField label="State" error={errors.state} {...register("state")} />
                    <TextField label="City" error={errors.city} {...register("city")} />
                    <TextField label="Address" error={errors.address} {...register("address")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextField
                      label="Bedrooms"
                      error={errors.bedrooms}
                      min="0"
                      type="number"
                      {...register("bedrooms")}
                    />
                    <TextField
                      label="Bathrooms"
                      error={errors.bathrooms}
                      min="0"
                      type="number"
                      {...register("bathrooms")}
                    />
                    <TextField
                      label="Parking spaces"
                      error={errors.parking_spaces}
                      min="0"
                      type="number"
                      {...register("parking_spaces")}
                    />
                    <TextField
                      label="Land size sqm"
                      error={errors.land_size}
                      min="1"
                      type="number"
                      {...register("land_size")}
                    />
                    <TextField
                      label="Floor area sqm"
                      error={errors.floor_area}
                      min="1"
                      type="number"
                      {...register("floor_area")}
                    />
                  </div>
                </>
              ) : null}
            </section>
            <Card className="h-fit p-4">
              <FormMessage tone="error">{serverError}</FormMessage>
              {step === "basic" ? (
                <Button className="mt-4 w-full" onClick={goToLocation}>
                  Continue to location
                </Button>
              ) : (
                <>
                  <Button
                    className="mt-4 w-full"
                    disabled={mutation.isPending}
                    type="submit"
                  >
                    {mutation.isPending ? "Saving draft..." : "Save draft and add media"}
                  </Button>
                  <Button
                    className="mt-3 w-full"
                    onClick={() => setStep("basic")}
                    variant="secondary"
                  >
                    Back
                  </Button>
                </>
              )}
            </Card>
          </form>
        )}
      </main>
    </ProtectedRoute>
  );
}
