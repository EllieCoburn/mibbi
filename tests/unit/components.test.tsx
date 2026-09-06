import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { getPersonality, dailyLine } from "@/lib/content/personalities";

describe("MibbiAvatar", () => {
  it("renders placeholder art with an accessible name when no image is set", () => {
    render(<MibbiAvatar name="Crumb" color="#F2A65A" shape="blob" personalityKey="worrier" />);
    expect(screen.getByRole("img", { name: "Crumb" })).toBeInTheDocument();
  });
  it("renders a silhouette label for un-owned characters", () => {
    render(<MibbiAvatar name="Pickle" color="#7FA36B" silhouette />);
    expect(screen.getByRole("img", { name: /Pickle \(not adopted yet\)/ })).toBeInTheDocument();
  });
  it("prefers final artwork when provided", () => {
    render(<MibbiAvatar name="Toast" color="#C98A4B" imageUrl="https://cdn.example/toast.png" />);
    expect(screen.getByRole("img", { name: "Toast" })).toHaveAttribute("src", "https://cdn.example/toast.png");
  });
});

describe("Field", () => {
  it("wires the error message to the input for screen readers", () => {
    render(<Field label="Email" name="email" error="That email doesn't look right." />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("That email doesn't look right.");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });
});

describe("Button", () => {
  it("is disabled and busy while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("personalities", () => {
  it("falls back to a neutral personality for unknown keys", () => {
    expect(getPersonality("brand-new-key").expression).toBe("neutral");
    expect(getPersonality(null).key).toBe("default");
  });
  it("returns a stable daily line", () => {
    const p = getPersonality("worrier");
    expect(dailyLine(p, 3)).toBe(dailyLine(p, 3));
    expect(p.lines).toContain(dailyLine(p, 7));
  });
});
