# Mibbi — Security, privacy and child safety

## Principles

1. **The database is the last line of defence.** RLS on every table; value-moving operations only through SECURITY DEFINER functions; column-level grants for user-editable fields.
2. **Adoption codes are assets.** Hash-only storage with a server-side pepper; single-use enforced with row locks; attempt logging and limits inside the same transaction.
3. **Collect the minimum.** Email (guardian), password (held by Supabase Auth), display name. No birthdays, names, photos, locations.
4. **No social surface.** No chat, DMs, comments, public profiles, friend lists, trading or user-generated public content. This is a product decision, not a temporary gap.
5. **Calm engagement.** Daily gifts and streaks are gentle; no timers, loot boxes, real-money coin packs or "your Mibbi is dying" pressure.

## Threat model and mitigations

| Threat                                            | Mitigation                                                                                                                                                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guessing adoption codes online                    | 12-char code from a 31-symbol alphabet (~59 bits); format pre-check rejects garbage before the DB; DB-enforced limits: 10 failed/user/hour, 30 failed/IP-hash/hour; valid codes are refused while limited. Phase 8 adds an edge limiter. |
| Database leak exposes codes                       | Only `HMAC-SHA256(pepper, code)` is stored. The pepper lives in `ADOPTION_CODE_PEPPER` (Vercel env), never in Postgres or the client bundle.                                                                                             |
| Double redemption / race                          | `SELECT … FOR UPDATE` on the code row; `adoption_code_id` is UNIQUE on `user_mibbis`; CHECK constraint keeps status/redeemed columns consistent.                                                                                         |
| Client tampering with coins, inventory, ownership | Users have no INSERT/UPDATE on those tables; `apply_currency_transaction` / `grant_item` are not executable by `authenticated`; `purchase_item` re-validates price and availability server-side.                                         |
| Placing items you don't own in your room          | DB trigger checks inventory quantity on every `room_items` insert/update.                                                                                                                                                                |
| Privilege escalation to admin                     | Admin status is a separate table (`admin_users`) with owner-only writes; `is_admin()` is SECURITY DEFINER; `/admin` layout checks server-side; profile `status` column is not grantable to users.                                        |
| Open redirect after login                         | `safeNextPath()` allows only same-origin relative paths.                                                                                                                                                                                 |
| Account enumeration                               | Password-reset form always reports success; error messages are generic.                                                                                                                                                                  |
| Session forgery                                   | Proxy and server use `supabase.auth.getUser()` (validates the JWT) rather than `getSession()`.                                                                                                                                           |
| Secrets in the browser                            | `server-only` imports on env/admin/hash modules make bundling them a build error. Only `NEXT_PUBLIC_*` reaches the client.                                                                                                               |
| Admin abuse                                       | Every admin mutation writes `audit_logs` (Phase 7); role hierarchy owner > admin > support.                                                                                                                                              |
| XSS via nicknames / names                         | Strict CHECK constraints (letters, numbers, spaces, `'`, `-`), React escapes output.                                                                                                                                                     |

## Child privacy

- Sign-up asks the adult for consent and links the parent information page. **This is not legal compliance.** COPPA (US), GDPR-K (EU), the UK Age Appropriate Design Code and others require professional legal review before public launch, and may require verifiable parental consent mechanisms beyond a checkbox. Budget for that review.
- Display names and nicknames are visible only to the account owner in the MVP. If any social feature is ever added, it must use predefined phrases and moderated content, never free text.
- Analytics are first-party tables only. No third-party tracking SDKs. Aggregations (Phase 7) count events, never profile individuals.
- Data deletion: deleting the `auth.users` row cascades through every user table (all FKs are `on delete cascade` for user data). A self-service "delete my account" flow is a Phase 8 item.

## Operational checklist before launch (Phase 8)

- [ ] Generate a production `ADOPTION_CODE_PEPPER` (32+ random chars), store in Vercel and a password manager. Never rotate without a plan.
- [ ] Turn on Supabase email confirmations and configure a real SMTP provider.
- [ ] Set Supabase Auth rate limits and password strength policy.
- [ ] Restrict `additional_redirect_urls` to production domains.
- [ ] Enable Vercel WAF / rate limiting on `/adopt`, `/login`, `/signup`.
- [ ] Review every RLS policy with `supabase inspect` / manual tests (the SQL test suite covers the core ones).
- [ ] Privacy policy + terms reviewed by counsel; link from `/parents` and sign-up.
- [ ] Backups verified; point-in-time recovery enabled on the Supabase project.
