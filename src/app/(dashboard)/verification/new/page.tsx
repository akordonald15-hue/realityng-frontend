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
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createVerificationRequest,
  type VerificationRequestPayload,
} from "@/lib/api/verification";

const verificationSchema = z.object({
  verification_type: z.enum([
    "agent",
    "landlord",
    "artisan",
    "identity",
    "property_ownership",
    "property_listing",
  ]),
  business_name: z.string().min(2, "Business name is required."),
  cac_registration_number: z
    .string()
    .min(2, "CAC registration number is required."),
  trade_category: z.string().min(2, "Trade category is required."),
  years_experience: z.coerce
    .number()
    .nonnegative("Years of experience cannot be negative."),
  phone_number: z.string().min(7, "Enter a valid phone number."),
  contact_address: z.string().min(5, "Contact address is required."),
  city: z.string().min(1, "City is required."),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function NewVerificationRequestPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
  });

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
              <TextField
                label="Business name"
                error={errors.business_name}
                {...register("business_name")}
              />
              <TextField
                label="CAC registration number"
                error={errors.cac_registration_number}
                {...register("cac_registration_number")}
              />
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
