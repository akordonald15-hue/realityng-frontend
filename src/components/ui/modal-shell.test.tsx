import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ModalShell } from "@/components/ui/modal-shell";

describe("ModalShell", () => {
  it("labels the dialog, focuses its first control, closes on Escape, and restores focus", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">Open dialog</button>
          {open ? (
            <ModalShell
              description="Confirm the action"
              onClose={() => {
                onClose();
                setOpen(false);
              }}
              title="Review application"
            >
              <button type="button">Confirm</button>
            </ModalShell>
          ) : null}
        </>
      );
    }
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Open dialog" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Review application" });
    expect(dialog).toHaveAccessibleDescription("Confirm the action");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
  });

  it("wraps keyboard focus within the dialog", async () => {
    const user = userEvent.setup();
    render(
      <ModalShell onClose={() => undefined} title="Keyboard test">
        <button type="button">Last action</button>
      </ModalShell>,
    );

    const close = screen.getByRole("button", { name: "Close" });
    const last = screen.getByRole("button", { name: "Last action" });
    last.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });
});
