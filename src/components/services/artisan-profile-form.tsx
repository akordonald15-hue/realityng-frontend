"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { ProviderCompletenessChecklist } from "@/components/services/provider-completeness-checklist";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createProviderTrade,
  createServiceArea,
  getMyProviderProfile,
  getTradeCategories,
  listProviderTrades,
  listServiceAreas,
  submitProviderProfile,
  updateMyProviderProfile,
  updateProviderTrade,
  updateServiceArea,
  type OwnerServiceProvider,
  type ProviderProfilePayload,
  type ServiceAreaPayload,
  type TradeCategory,
} from "@/lib/api/services";

function flattenCategories(categories: TradeCategory[]): TradeCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

function formValue(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export function ArtisanProfileForm({ initialProfile }: { initialProfile: OwnerServiceProvider }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const categoriesQuery = useQuery({ queryKey: ["service-categories"], queryFn: getTradeCategories });
  const tradesQuery = useQuery({ queryKey: ["my-provider-trades"], queryFn: listProviderTrades });
  const areasQuery = useQuery({ queryKey: ["my-provider-service-areas"], queryFn: listServiceAreas });
  const profileQuery = useQuery({
    queryKey: ["my-provider-profile"],
    queryFn: getMyProviderProfile,
    initialData: initialProfile,
  });

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []).filter((category) => !category.children.length),
    [categoriesQuery.data],
  );
  const profile = profileQuery.data;
  const canEdit = ["draft", "rejected", "needs_more_information", "active"].includes(
    profile.status ?? "draft",
  );

  const saveProfile = useMutation({
    mutationFn: updateMyProviderProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["my-provider-profile"], data);
      setMessage("Provider profile draft saved.");
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const submitProfile = useMutation({
    mutationFn: submitProviderProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["my-provider-profile"], data);
      setMessage("Provider profile submitted for review.");
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const tradeMutation = useMutation({
    mutationFn: (payload: { category_id: string; years_experience: number; is_primary: boolean }) =>
      createProviderTrade({
        ...payload,
        skill_level: "intermediate",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-trades"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const areaMutation = useMutation({
    mutationFn: (payload: ServiceAreaPayload) => createServiceArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-service-areas"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const primaryTradeMutation = useMutation({
    mutationFn: (id: string) => updateProviderTrade(id, { is_primary: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-trades"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
  });

  const primaryAreaMutation = useMutation({
    mutationFn: (id: string) => updateServiceArea(id, { is_primary: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-service-areas"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
  });

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: ProviderProfilePayload = {
      provider_type: formValue(form, "provider_type") as ProviderProfilePayload["provider_type"],
      business_name: formValue(form, "business_name"),
      headline: formValue(form, "headline"),
      biography: formValue(form, "biography"),
      phone: formValue(form, "phone"),
      email: formValue(form, "email"),
      country: formValue(form, "country") || "Nigeria",
      state: formValue(form, "state"),
      city: formValue(form, "city"),
      lga: formValue(form, "lga"),
      neighborhood: formValue(form, "neighborhood"),
      display_location: formValue(form, "display_location"),
      private_address: formValue(form, "private_address"),
    };
    saveProfile.mutate(payload);
  }

  function handleTradeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    tradeMutation.mutate({
      category_id: formValue(form, "category_id"),
      years_experience: Number(form.get("years_experience") ?? 0),
      is_primary: form.get("is_primary") === "on",
    });
    event.currentTarget.reset();
  }

  function handleAreaSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    areaMutation.mutate({
      country: "Nigeria",
      state: formValue(form, "state"),
      city: formValue(form, "city"),
      lga: formValue(form, "lga"),
      neighborhood: formValue(form, "neighborhood"),
      service_radius_km: Number(form.get("service_radius_km") || 0) || null,
      is_primary: form.get("is_primary") === "on",
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">
                Profile editor
              </p>
              <h1 className="mt-2 font-heading text-3xl font-semibold text-brand-text">
                Manage public provider profile
              </h1>
            </div>
            <ProviderStatusBadge status={profile.status} />
          </div>
          {message ? <div className="mt-4"><FormMessage>{message}</FormMessage></div> : null}

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-brand-text">
              Provider type
              <Select defaultValue={profile.provider_type} disabled={!canEdit} name="provider_type">
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-brand-text">
              Business name
              <Input defaultValue={profile.business_name} disabled={!canEdit} name="business_name" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-brand-text sm:col-span-2">
              Headline
              <Input defaultValue={profile.headline} disabled={!canEdit} name="headline" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-brand-text sm:col-span-2">
              Biography
              <textarea
                className="min-h-28 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                defaultValue={profile.biography}
                disabled={!canEdit}
                name="biography"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-brand-text">
              Phone
              <Input defaultValue={profile.phone} disabled={!canEdit} name="phone" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-brand-text">
              Email
              <Input defaultValue={profile.email} disabled={!canEdit} name="email" type="email" />
            </label>
            {["country", "state", "city", "lga", "neighborhood", "display_location", "private_address"].map(
              (field) => (
                <label className="grid gap-2 text-sm font-semibold text-brand-text" key={field}>
                  {field.replace("_", " ")}
                  <Input
                    defaultValue={String(profile[field as keyof OwnerServiceProvider] ?? "")}
                    disabled={!canEdit}
                    name={field}
                  />
                </label>
              ),
            )}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button disabled={!canEdit || saveProfile.isPending} type="submit">
                {saveProfile.isPending ? "Saving..." : "Save draft"}
              </Button>
              <Button
                disabled={submitProfile.isPending}
                onClick={() => submitProfile.mutate()}
                type="button"
                variant="secondary"
              >
                {submitProfile.isPending ? "Submitting..." : "Submit for review"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Trade categories</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_9rem_auto_auto]" onSubmit={handleTradeSubmit}>
            <Select aria-label="Trade category" name="category_id" required>
              <option value="">Select trade</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.requires_certification ? " - certification required" : ""}
                </option>
              ))}
            </Select>
            <Input min={0} name="years_experience" placeholder="Years" type="number" />
            <label className="flex items-center gap-2 text-sm text-brand-muted">
              <input name="is_primary" type="checkbox" /> Primary
            </label>
            <Button disabled={tradeMutation.isPending} type="submit">Add trade</Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tradesQuery.data ?? []).map((trade) => (
              <button
                className="rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-brand-muted transition hover:border-brand-secondary"
                key={trade.id}
                onClick={() => primaryTradeMutation.mutate(trade.id)}
                type="button"
              >
                <span className="font-semibold text-brand-text">{trade.category.name}</span>
                {trade.is_primary ? <Badge className="ml-2">Primary</Badge> : null}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Service areas</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleAreaSubmit}>
            <Input name="state" placeholder="State" required />
            <Input name="city" placeholder="City" required />
            <Input name="lga" placeholder="LGA" />
            <Input name="neighborhood" placeholder="Neighborhood" />
            <Input min={1} max={100} name="service_radius_km" placeholder="Radius km" type="number" />
            <label className="flex items-center gap-2 text-sm text-brand-muted">
              <input name="is_primary" type="checkbox" /> Primary area
            </label>
            <Button className="md:col-span-3" disabled={areaMutation.isPending} type="submit">
              Add service area
            </Button>
          </form>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(areasQuery.data ?? []).map((area) => (
              <button
                className="rounded-md border border-white/10 bg-white/5 p-3 text-left text-sm text-brand-muted transition hover:border-brand-secondary"
                key={area.id}
                onClick={() => primaryAreaMutation.mutate(area.id)}
                type="button"
              >
                <span className="font-semibold text-brand-text">
                  {[area.neighborhood, area.lga, area.city, area.state].filter(Boolean).join(", ")}
                </span>
                {area.is_primary ? <Badge className="ml-2">Primary</Badge> : null}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <aside className="space-y-6">
        <ProviderCompletenessChecklist completion={profile.completion} />
        <Card className="p-5 text-sm leading-6 text-brand-muted">
          Material identity, business, trade, location, and certification changes can require
          RealityNG moderation before they are public.
        </Card>
      </aside>
    </div>
  );
}
