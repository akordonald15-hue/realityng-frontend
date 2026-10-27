import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewVerificationRequestPage from "@/app/(dashboard)/verification/new/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/api/verification", () => ({
  createVerificationRequest: (payload: unknown) => mocks.submit(payload),
}));
function submit() {
  fireEvent.submit(screen.getByRole("button", { name: "Submit for review" }).closest("form")!);
}
function fillCommon() {
  for (const [label, value] of [
    ["Phone number", "08012345678"],
    ["Contact address", "  Admiralty Way  "],
    ["City", "  Lagos  "],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
describe("Verification Zod 4 integration", () => {
  beforeEach(() => {
    mocks.submit.mockReset();
    mocks.submit.mockResolvedValue({ id: "test-only" });
  });
  it("returns required agent field errors without submitting", async () => {
    renderWithQueryClient(<NewVerificationRequestPage />);
    submit();
    for (const text of [
      "Enter a valid phone number.",
      "Contact address is required.",
      "City is required.",
      "Business or agency name is required.",
      "CAC registration number is required.",
    ])
      expect(await screen.findByText(text)).toBeInTheDocument();
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it("requires artisan trade and experience, then submits a trimmed numeric payload", async () => {
    renderWithQueryClient(<NewVerificationRequestPage />);
    fireEvent.change(screen.getByLabelText("Verification type"), { target: { value: "artisan" } });
    fillCommon();
    submit();
    expect(await screen.findByText("Trade category is required.")).toBeInTheDocument();
    expect(screen.getByText("Years of experience is required.")).toBeInTheDocument();
    expect(mocks.submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Trade category"), { target: { value: "  Plumber  " } });
    fireEvent.change(screen.getByLabelText("Years of experience"), { target: { value: "0" } });
    submit();
    await waitFor(() =>
      expect(mocks.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          verification_type: "artisan",
          trade_category: "Plumber",
          years_experience: 0,
          city: "Lagos",
          contact_address: "Admiralty Way",
        }),
      ),
    );
  });
  it.each(["-1", "1.5", "9007199254740992"])(
    "rejects invalid experience %s without throwing",
    async (value) => {
      renderWithQueryClient(<NewVerificationRequestPage />);
      fireEvent.change(screen.getByLabelText("Verification type"), {
        target: { value: "artisan" },
      });
      fillCommon();
      fireEvent.change(screen.getByLabelText("Trade category"), { target: { value: "Plumber" } });
      fireEvent.change(screen.getByLabelText("Years of experience"), { target: { value } });
      submit();
      await waitFor(() =>
        expect(screen.getByLabelText("Years of experience")).toHaveAttribute(
          "aria-invalid",
          "true",
        ),
      );
      expect(mocks.submit).not.toHaveBeenCalled();
    },
  );
  it("allows landlord verification without artisan or agent-only fields", async () => {
    renderWithQueryClient(<NewVerificationRequestPage />);
    fireEvent.change(screen.getByLabelText("Verification type"), { target: { value: "landlord" } });
    fillCommon();
    submit();
    await waitFor(() =>
      expect(mocks.submit).toHaveBeenCalledWith(
        expect.objectContaining({ verification_type: "landlord", city: "Lagos" }),
      ),
    );
  });
  it("submits valid agent verification with its required business details", async () => {
    renderWithQueryClient(<NewVerificationRequestPage />);
    fillCommon();
    fireEvent.change(screen.getByLabelText("Business or agency name"), {
      target: { value: "Synthetic Agency" },
    });
    fireEvent.change(screen.getByLabelText("CAC registration number"), {
      target: { value: "SYNTHETIC-CAC" },
    });
    submit();
    await waitFor(() =>
      expect(mocks.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          verification_type: "agent",
          business_name: "Synthetic Agency",
          cac_registration_number: "SYNTHETIC-CAC",
        }),
      ),
    );
  });
  it.each(["", "Infinity", "not-a-number"])(
    "keeps invalid browser numeric input %s from submitting artisan verification",
    async (value) => {
      renderWithQueryClient(<NewVerificationRequestPage />);
      fireEvent.change(screen.getByLabelText("Verification type"), {
        target: { value: "artisan" },
      });
      fillCommon();
      fireEvent.change(screen.getByLabelText("Trade category"), { target: { value: "Plumber" } });
      fireEvent.change(screen.getByLabelText("Years of experience"), { target: { value } });
      submit();
      expect(await screen.findByText("Years of experience is required.")).toBeInTheDocument();
      expect(mocks.submit).not.toHaveBeenCalled();
    },
  );
});

describe("Verification submission messages", () => {
  beforeEach(() => {
    mocks.submit.mockReset();
    mocks.submit.mockResolvedValue({ id: "test-only" });
  });

  function fillValidAgent() {
    fillCommon();
    fireEvent.change(screen.getByLabelText("Business or agency name"), {
      target: { value: "Synthetic Agency" },
    });
    fireEvent.change(screen.getByLabelText("CAC registration number"), {
      target: { value: "SYNTHETIC-CAC" },
    });
  }

  it("does not show an error before any submission", () => {
    renderWithQueryClient(<NewVerificationRequestPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled();
  });

  it("preserves loading and successful submission without an error banner", async () => {
    let resolveSubmission!: (value: { id: string }) => void;
    mocks.submit.mockReturnValueOnce(new Promise((resolve) => {
      resolveSubmission = resolve;
    }));
    renderWithQueryClient(<NewVerificationRequestPage />);
    fillValidAgent();
    submit();

    expect(await screen.findByRole("button", { name: "Submitting..." })).toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.submit).toHaveBeenCalledWith(expect.objectContaining({
      verification_type: "agent",
      business_name: "Synthetic Agency",
      cac_registration_number: "SYNTHETIC-CAC",
    }));

    await act(async () => {
      resolveSubmission({ id: "test-only" });
    });
    expect(await screen.findByRole("button", { name: "Submit for review" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    [
      { isAxiosError: true, response: { data: { detail: "Verification is already under review." } } },
      "Verification is already under review.",
    ],
    [{ isAxiosError: true, response: { data: {} } }, "The request could not be completed."],
    [new Error("Network unavailable"), "Something went wrong. Please try again."],
  ] as const)("shows an accessible genuine failure with the appropriate message %#", async (error, message) => {
    mocks.submit.mockRejectedValueOnce(error);
    renderWithQueryClient(<NewVerificationRequestPage />);
    fillValidAgent();
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled();
    expect(screen.getByLabelText("Business or agency name")).toHaveValue("Synthetic Agency");
  });

  it("clears a failed submission's error during retry and after success", async () => {
    let resolveRetry!: (value: { id: string }) => void;
    mocks.submit.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { detail: "Please retry your verification request." } },
    }).mockReturnValueOnce(new Promise((resolve) => {
      resolveRetry = resolve;
    }));
    renderWithQueryClient(<NewVerificationRequestPage />);
    fillValidAgent();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Please retry your verification request.");

    submit();
    expect(await screen.findByRole("button", { name: "Submitting..." })).toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.submit).toHaveBeenCalledTimes(2);
    expect(mocks.submit.mock.calls[1][0]).toEqual(mocks.submit.mock.calls[0][0]);

    await act(async () => {
      resolveRetry({ id: "test-only" });
    });
    expect(await screen.findByRole("button", { name: "Submit for review" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
