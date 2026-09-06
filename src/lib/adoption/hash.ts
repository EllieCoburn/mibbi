import "server-only";

/**
 * Server-side hashing of adoption codes.
 * hash = hex(HMAC-SHA256(pepper, normalizedCode))
 *
 * The database only ever stores and compares this hash. Keep the pepper in
 * ADOPTION_CODE_PEPPER and never rotate it casually: every printed code
 * depends on it.
 */
import { createHmac } from "node:crypto";
import { getServerEnv } from "@/lib/env";

export function hashAdoptionCode(normalizedCode: string, pepper: string = getServerEnv().ADOPTION_CODE_PEPPER): string {
  return createHmac("sha256", pepper).update(normalizedCode).digest("hex");
}

/** SHA-256 of an IP address, used for per-IP rate limiting without storing IPs. */
export function hashIpAddress(ip: string | null | undefined, pepper: string = getServerEnv().ADOPTION_CODE_PEPPER): string | null {
  if (!ip) return null;
  return createHmac("sha256", pepper).update(`ip:${ip}`).digest("hex");
}
