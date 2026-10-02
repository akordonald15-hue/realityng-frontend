import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminShell } from "@/components/admin/admin-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/services/providers" }));
vi.mock("@/components/layout/navbar", () => ({ Navbar: () => <div>Global navigation</div> }));

describe("AdminShell", () => {
  it("identifies the active operational section", () => {
    render(<AdminShell><p>Queue content</p></AdminShell>);
    expect(screen.getByRole("link", { name: "Providers" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation", { name: "Admin sections" })).toBeInTheDocument();
  });
});

describe("AdminPagination", () => {
  it("announces position and exposes named navigation controls", () => {
    render(
      <AdminPagination count={62} hasNext hasPrevious onPageChange={vi.fn()} page={2} />,
    );
    expect(screen.getByText("Page 2 · 62 total records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeEnabled();
  });
});
