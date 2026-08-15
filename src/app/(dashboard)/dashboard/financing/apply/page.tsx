"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FinancingProductCard } from "@/components/payments/financing-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createFinancingApplication,
  listFinancingProducts,
  type FinancingProduct,
} from "@/lib/api/financing";

export default function FinancingApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  const [selectedProduct, setSelectedProduct] = useState<FinancingProduct | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    requested_amount: "",
    purpose: "",
    preferred_tenor_months: 6,
    employment_status: "employed",
    monthly_income_band: "",
    state: "Lagos",
    city: "Lagos",
    applicant_message: "",
  });

  const productsQuery = useQuery({
    queryKey: ["financing", "products"],
    queryFn: () => listFinancingProducts(),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedProduct) throw new Error("Select a financing product first.");
      return createFinancingApplication({
        product_id: selectedProduct.id,
        transaction_id: transactionId,
        requested_amount: form.requested_amount,
        currency: selectedProduct.currency,
        purpose: form.purpose,
        preferred_tenor_months: Number(form.preferred_tenor_months),
        employment_status: form.employment_status,
        monthly_income_band: form.monthly_income_band,
        state: form.state,
        city: form.city,
        applicant_message: form.applicant_message,
      });
    },
    onMutate: () => setError(""),
    onSuccess: (application) => router.push(`/dashboard/financing/${application.id}`),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Apply for financing"
          description="Choose a partner product and create a private application draft."
        />

        <section className="mt-6 grid gap-3">
          {productsQuery.data?.map((product) => (
            <FinancingProductCard
              key={product.id}
              product={product}
              onSelect={() => setSelectedProduct(product)}
            />
          ))}
        </section>

        <Card className="mt-6 p-4">
          <h2 className="text-lg font-semibold text-brand-text">
            Application details
          </h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-1 text-sm text-brand-text">
              Amount requested
              <Input
                required
                value={form.requested_amount}
                onChange={(e) => setForm({ ...form, requested_amount: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text">
              Tenor
              <Input
                min={1}
                type="number"
                value={form.preferred_tenor_months}
                onChange={(e) =>
                  setForm({ ...form, preferred_tenor_months: Number(e.target.value) })
                }
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text">
              Employment status
              <Select
                value={form.employment_status}
                onChange={(e) => setForm({ ...form, employment_status: e.target.value })}
              >
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="business_owner">Business owner</option>
              </Select>
            </label>
            <label className="grid gap-1 text-sm text-brand-text">
              Monthly income band
              <Input
                required
                value={form.monthly_income_band}
                onChange={(e) => setForm({ ...form, monthly_income_band: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text">
              State
              <Input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text">
              City
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text sm:col-span-2">
              Purpose
              <textarea
                required
                className="min-h-24 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-brand-text"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm text-brand-text sm:col-span-2">
              Message to RealityNG operations
              <textarea
                className="min-h-20 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-brand-text"
                value={form.applicant_message}
                onChange={(e) => setForm({ ...form, applicant_message: e.target.value })}
              />
            </label>
            {error ? <p className="text-sm text-red-300 sm:col-span-2">{error}</p> : null}
            <Button className="sm:col-span-2" disabled={!selectedProduct || createMutation.isPending} type="submit">
              {createMutation.isPending ? "Creating..." : "Create financing draft"}
            </Button>
          </form>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
