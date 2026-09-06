import { describe, expect, it } from "vitest";
import { isAuthRoute, isProtectedRoute, safeNextPath } from "@/lib/routes";

describe("isProtectedRoute", () => {
  it("protects app routes and their children", () => {
    expect(isProtectedRoute("/home")).toBe(true);
    expect(isProtectedRoute("/admin/codes")).toBe(true);
    expect(isProtectedRoute("/collection")).toBe(true);
  });
  it("leaves public routes open", () => {
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/mibbis/crumb")).toBe(false);
    expect(isProtectedRoute("/parents")).toBe(false);
    expect(isProtectedRoute("/homestead")).toBe(false); // prefix must be a full segment
  });
});

describe("isAuthRoute", () => {
  it("matches login and signup only", () => {
    expect(isAuthRoute("/login")).toBe(true);
    expect(isAuthRoute("/signup")).toBe(true);
    expect(isAuthRoute("/forgot-password")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("allows relative paths", () => {
    expect(safeNextPath("/adopt?code=abc")).toBe("/adopt?code=abc");
  });
  it("rejects external and protocol-relative URLs", () => {
    expect(safeNextPath("https://evil.example")).toBe("/home");
    expect(safeNextPath("//evil.example")).toBe("/home");
    expect(safeNextPath("/\\evil.example")).toBe("/home");
    expect(safeNextPath(null)).toBe("/home");
  });
});
