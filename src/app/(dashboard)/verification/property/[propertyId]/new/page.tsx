"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getPublicProperty } from "@/lib/api/properties";
import {
  createPropertyVerificationRequest,
  uploadPropertyVerificationDocument,
  type VerificationDocumentType,
} from "@/lib/api/property-verification";

type EvidenceFiles = {
  ownership_evidence: File | null;
  location_evidence: File | null;
  inspection_evidence: File | null;
};

const EVIDENCE_FIELDS: {
  key: keyof EvidenceFiles;
  documentType: VerificationDocumentType;
  label: string;
  helpText: string;
}[] = [
  {
    key: "ownership_evidence",
    documentType: "ownership_evidence",
    label: "Ownership evidence",
    helpText: "Title deed, C of O, or similar proof of ownership.",
  },
  {
    key: "location_evidence",
    documentType: "location_evidence",
    label: "Location evidence",
    helpText: "Survey plan or a document confirming the property's location.",
  },
  {
    key: "inspection_evidence",
    documentType: "inspection_evidence",
    label: "Inspection evidence",
    helpText: "Recent photos or an inspection report of the property.",
  },
];

export default function NewPropertyVerificationPage() {
  const params = useParams<{ propertyId: string }>();
  const router = useRouter();
  const propertySlug = params.propertyId;

  const [files, setFiles] = useState<EvidenceFiles>({
    ownership_evidence: null,
    location_evidence: null,
    inspection_evidence: null,
  });
  const [uploadError, setUploadError] = useState("");
  const [uploadingLabel, setUploadingLabel] = useState("");

  const propertyQuery = useQuery({
    queryKey: ["public-property", propertySlug],
    queryFn: () => getPublicProperty(propertySlug),
    enabled: Boolean(propertySlug),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const request = await createPropertyVerificationRequest({
        property: propertySlug,
      });

      for (const field of EVIDENCE_FIELDS) {
        const file = files[field.key];
        if (!file) continue;
        setUploadingLabel(field.label);
        await uploadPropertyVerificationDocument(
          request.id,
          field.documentType,
          file
        );
      }

      return request;
    },
    onSuccess: () => {
      router.push("/verification");
    },
    onError: (error) => {
      setUploadError(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!mutation.isPending) {
      setUploadingLabel("");
    }
  }, [mutation.isPending]);

  function handleFileChange(
    key: keyof EvidenceFiles,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setUploadError("");
    mutation.mutate();
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl p-4">
        <form onSubmit={onSubmit}>
          <Card className="p-4">
            <SectionHeader
              eyebrow="Property Verification"
              title={
                propertyQuery.data ? propertyQuery.data.title : "Loading property..."
              }
              description="Submit evidence documents to verify this property. You can attach any combination of ownership, location, and inspection evidence."
            />

            <FormMessage tone="error">{uploadError}</FormMessage>

            <div className="mt-4 grid gap-6">
              {EVIDENCE_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-brand-text">
                    {field.label}
                  </label>
                  <p className="mt-1 text-xs text-brand-muted">
                    {field.helpText}
                  </p>
                  <input
                    type="file"
                    className="mt-2 block w-full text-sm"
                    onChange={(event) => handleFileChange(field.key, event)}
                  />
                </div>
              ))}
            </div>

            <Button
              className="mt-6 w-full"
              type="submit"
              disabled={mutation.isPending || !propertyQuery.data}
            >
              {mutation.isPending
                ? uploadingLabel
                  ? `Uploading ${uploadingLabel}...`
                  : "Submitting..."
                : "Submit for review"}
            </Button>
          </Card>
        </form>
      </main>
    </ProtectedRoute>
  );
}
