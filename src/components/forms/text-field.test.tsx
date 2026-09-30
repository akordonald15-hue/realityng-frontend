import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "@/components/forms/text-field";

describe("TextField", () => {
  it("associates validation errors with the input", () => {
    render(
      <TextField
        error={{ message: "Email is required", type: "required" }}
        label="Email"
        name="email"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Email is required");
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });
});
