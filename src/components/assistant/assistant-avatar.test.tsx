import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AssistantAvatar } from "./assistant-avatar";

it("identifies a decorative AI portrait with responsive sizing", () => {
  const { container } = render(<AssistantAvatar size="launcher" />);
  expect(screen.getByText("AI")).toBeInTheDocument();
  const image = container.querySelector("img")!;
  expect(image).toHaveAttribute("alt", "");
  expect(image).toHaveAttribute("sizes", "56px");
  expect(image.className).toContain("motion-safe:");
  expect(container.querySelector("[data-assistant-avatar]")).toHaveClass("h-11", "sm:h-14");
});
it("retains the original orb if the local portrait asset fails", () => {
  const { container } = render(<AssistantAvatar state="thinking" />);
  fireEvent.error(container.querySelector("img")!);
  expect(container.querySelector("img")).not.toBeInTheDocument();
  expect(container.querySelector(".assistant-orb-thinking")).toBeInTheDocument();
});
