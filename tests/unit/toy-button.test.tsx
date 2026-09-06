import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToyButton, ToyLink } from "@/components/ui/toy-button";

describe("ToyButton", () => {
  it("renders a real button with the toy styling", () => {
    render(<ToyButton color="butter">Squish</ToyButton>);
    const b = screen.getByRole("button", { name: "Squish" });
    expect(b.className).toContain("toy-btn");
  });
  it("renders a link with an accessible label", () => {
    render(
      <ToyLink href="/home" ariaLabel="Enter Mibbi World">
        Enter
      </ToyLink>,
    );
    expect(screen.getByRole("link", { name: "Enter Mibbi World" })).toHaveAttribute("href", "/home");
  });
});
