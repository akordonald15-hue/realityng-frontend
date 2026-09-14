"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageContainer } from "@/components/layout/page-container";
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
  const productId = searchParams.get("product_id");
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

  useEffect(() => {
    if (!productId || !productsQuery.data || selectedProduct) {
      return;
    }
    const product = productsQuery.data.find((item) => item.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  }, [productId, productsQuery.data, selectedProduct]);

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
      <main className="min-h-screen bg-reality-bg-muted py-8 text-reality-text-primary sm:py-14">
        <PageContainer className="max-w-5xl">
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

          <Card className="mt-6 rounded-[24px] p-5 sm:p-6" variant="reality">
            <h2 className="text-lg font-semibold text-reality-text-primary">Application details</h2>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              Amount requested
              <Input
                required
                value={form.requested_amount}
                onChange={(e) => setForm({ ...form, requested_amount: e.target.value })}
                variant="reality"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              Tenor
              <Input
                min={1}
                type="number"
                value={form.preferred_tenor_months}
                onChange={(e) =>
                  setForm({ ...form, preferred_tenor_months: Number(e.target.value) })
                }
                variant="reality"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              Employment status
              <Select
                value={form.employment_status}
                onChange={(e) => setForm({ ...form, employment_status: e.target.value })}
                variant="reality"
              >
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="business_owner">Business owner</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              Monthly income band
              <Input
                required
                value={form.monthly_income_band}
                onChange={(e) => setForm({ ...form, monthly_income_band: e.target.value })}
                variant="reality"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              State
              <Input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                variant="reality"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary">
              City
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                variant="reality"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary sm:col-span-2">
              Purpose
              <textarea
                required
                className="min-h-24 rounded-[12px] border border-reality-border-secondary bg-white p-3 text-sm text-reality-text-primary shadow-reality-sm outline-none transition focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-reality-text-secondary sm:col-span-2">
              Message to RealityNG operations
              <textarea
                className="min-h-20 rounded-[12px] border border-reality-border-secondary bg-white p-3 text-sm text-reality-text-primary shadow-reality-sm outline-none transition focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                value={form.applicant_message}
                onChange={(e) => setForm({ ...form, applicant_message: e.target.value })}
              />
            </label>
            {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
            <Button
              className="h-12 sm:col-span-2"
              disabled={!selectedProduct || createMutation.isPending}
              type="submit"
              variant="reality"
            >
              {createMutation.isPending ? "Creating..." : "Create financing draft"}
            </Button>
          </form>
        </Card>
        </PageContainer>
      </main>
    </ProtectedRoute>
  );
}

