"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createVerificationRequest,
  type VerificationRequestPayload,
  type VerificationType,
} from "@/lib/api/verification";

const verificationTypes: Array<{ value: VerificationType; label: string }> = [
  { value: "agent", label: "Agent" },
  { value: "landlord", label: "Landlord" },
  { value: "artisan", label: "Artisan" },
];

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const verificationSchema = z
  .object({
    verification_type: z.enum(["agent", "landlord", "artisan"]),
    business_name: optionalText,
    cac_registration_number: optionalText,
    trade_category: optionalText,
    years_experience: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number().int().nonnegative("Years of experience cannot be negative.").optional(),
    ),
    phone_number: optionalText,
    contact_address: optionalText,
    city: optionalText,
  })
  .superRefine((values, context) => {
    const requireText = (field: keyof VerificationFormValues, message: string) => {
      if (!values[field]) {
        context.addIssue({ code: "custom", path: [field], message });
      }
    };

    requireText("phone_number", "Enter a valid phone number.");
    requireText("contact_address", "Contact address is required.");
    requireText("city", "City is required.");

    if (values.verification_type === "agent") {
      requireText("business_name", "Business or agency name is required.");
      requireText("cac_registration_number", "CAC registration number is required.");
    }

    if (values.verification_type === "artisan") {
      requireText("trade_category", "Trade category is required.");
      if (values.years_experience === undefined) {
        context.addIssue({
          code: "custom",
          path: ["years_experience"],
          message: "Years of experience is required.",
        });
      }
    }
  });

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function NewVerificationRequestPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verification_type: "agent",
      business_name: "",
      cac_registration_number: "",
      trade_category: "",
      phone_number: "",
      contact_address: "",
      city: "",
    },
  });

  const verificationType = watch("verification_type");

  const mutation = useMutation({
    mutationFn: (values: VerificationRequestPayload) =>
      createVerificationRequest(values),
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl p-4">
        <form onSubmit={onSubmit}>
          <Card className="p-4">
            <h1 className="mb-4 text-xl font-semibold text-brand-text">
              Submit Verification Request
            </h1>

            <FormMessage tone="error">
              {getApiErrorMessage(mutation.error)}
            </FormMessage>

            <div className="grid gap-4">
              <label className="block text-sm font-medium text-brand-text">
                Verification type
                <Select className="mt-2" {...register("verification_type")}>
                  {verificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {errors.verification_type ? (
                  <span className="mt-1 block text-sm text-red-300">
                    {errors.verification_type.message}
                  </span>
                ) : null}
              </label>

              {verificationType === "agent" ? (
                <>
                  <TextField
                    label="Business or agency name"
                    error={errors.business_name}
                    {...register("business_name")}
                  />
                  <TextField
                    label="CAC registration number"
                    error={errors.cac_registration_number}
                    {...register("cac_registration_number")}
                  />
                </>
              ) : null}

              {verificationType === "artisan" ? (
                <>
                  <TextField
                    label="Trade category"
                    error={errors.trade_category}
                    {...register("trade_category")}
                  />
                  <TextField
                    label="Years of experience"
                    type="number"
                    min="0"
                    error={errors.years_experience}
                    {...register("years_experience")}
                  />
                </>
              ) : null}

              <TextField
                label="Phone number"
                error={errors.phone_number}
                {...register("phone_number")}
              />
              <TextField
                label="Contact address"
                error={errors.contact_address}
                {...register("contact_address")}
              />
              <TextField
                label="City"
                error={errors.city}
                {...register("city")}
              />
            </div>

            <Button
              className="mt-4 w-full"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit for review"}
            </Button>
          </Card>
        </form>
      </main>
    </ProtectedRoute>
  );
}
