# RealityNG Sprint E Product UI/UX Audit

Status: baseline audit in progress; route-specific implementation has not started

Baseline: frontend `693717cbf3d75ca56376aea13eb8dd943fc7352b`

Audit date: 2026-09-30

## Audit method and limits

This inventory covers every App Router page currently in `src/app` (94 pages), the shared UI/form/layout layer, existing unit and Playwright coverage, and the design/implementation reports committed to the repository. Direct Figma URLs or node identifiers are not present in the repository. Consequently, fidelity is classified from the committed implementation plans, tests that explicitly call a surface Figma-aligned, and the approved RealityNG visual foundation. A route is not marked `MATCH` without a direct design comparison.

Each route below inherits the assessment for its audit family. Route-specific screenshot, keyboard, empty/loading/error, and intermediate-resize results will be appended as its implementation batch is completed.

Assessment codes:

- `D`: FIGMA-DESIGNED — direct evidence in implementation/tests, but source-node comparison is still required.
- `P`: PARTIALLY FIGMA-DESIGNED — an approved direction exists, with product evolution or missing screen coverage.
- `E`: ENGINEER-DESIGNED / SHARED-COMPONENT.
- `F`: FUNCTIONAL / INTERNAL.
- `A`: acceptable baseline, targeted refinement needed.
- `R`: material design/accessibility debt; prioritize before controlled beta.
- `V`: needs visual/manual verification before a quality verdict.

## Product-wide baseline

| Area | Evidence | Baseline verdict |
| --- | --- | --- |
| Route surface | 94 pages: 18 public, 4 auth, 43 dashboard, 22 admin, 7 root/misc | Broad functional coverage; authenticated and internal surfaces dominate the remaining polish effort. |
| Shared UI | 14 core primitives plus form/layout components | Useful semantic foundation, but incomplete dialog, form-error, empty/error, and responsive data-display conventions. |
| Surface rhythm | 128 `bg-white` occurrences; canvas tokens exist but root/body were white | `R`: excessive white is systemic, not isolated to one page. |
| Token consistency | 51 literal hex occurrences in TSX/CSS; legacy and Reality token families coexist | `R`: consolidate opportunistically; do not rewrite the whole design system. |
| Focus/accessibility | 31 source files contain `focus-visible`; 63 contain an ARIA attribute | `R`: coverage is uneven and counts do not prove correct behavior. |
| Dialogs | Six files declare dialogs; shared `ModalShell` lacked focus entry/trap/Escape/restore | `R`: E1 launch-critical shared fix. |
| Forms | Shared `TextField` rendered its error inside its label | `R`: error became part of the accessible name; E1 fix associates it as a description. |
| Scroll behavior | Browser scrollbars were globally hidden | `R`: harms discoverability and keyboard/low-vision use; E1 restricts hiding to explicit utility use. |
| Motion | GSAP plus custom CSS motion; reduced-motion rules exist for major public/assistant artwork | `A/V`: good foundation; route-level transitions still need review. |
| Automated a11y | No axe package or route scan existed | `R`: E1 adds Playwright axe coverage for critical public and cross-role surfaces. |
| Responsive automation | Playwright projects cover 1440, 1366, 768, 390, 360 | `A/V`: add the required 1280, 1024, and 375 checks and manual intermediate resizing. |
| Performance guardrail | Property detail request path is exactly three calls after Sprint D | Must remain unchanged in every Sprint E batch. |

## Audit-family assessments

| Family | Class | Desktop | Mobile | Fidelity | Spacing/type/surfaces | States | Accessibility | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PUB-MARKETING | P | A | A/V | ACCEPTABLE PRODUCT EVOLUTION; direct Figma source absent | Strongest brand expression; verify section rhythm and imagery contrast | Zero-inventory homepage state is launch-critical | Motion/reduced motion exists; keyboard/contrast scan required | E2 |
| PUB-PROPERTY | P | A/V | R/V | ACCEPTABLE PRODUCT EVOLUTION | Dense filtering/gallery/card variants; many white surfaces | Loading, zero results, errors, image absence, unavailable and similar results | Mobile filters, gallery controls, map/video absence | E2 |
| PUB-TRUST | E | A | A/V | No dedicated Figma evidence | Shared `PublicInfoPage` creates consistency | Static content and recovery links | Heading order, link purpose, long-text zoom | E2/E7 |
| AUTH | P | A/V | R/V | Partial approved auth direction | Shared auth card/flow, but modal/page variants coexist | Validation, Google, disabled/loading, continuation | Keyboard viewport, error announcements, modal focus | E2 |
| ONBOARDING | E | A/V | R/V | No dedicated Figma evidence | Sparse role/progress treatment | Completion, abandonment/re-entry | Clear permissions language and focus order | E2 |
| BUYER | D/P | A/V | R/V | Buyer dashboard test explicitly calls it Figma-aligned | Large 2,398+ line multi-persona page and many white cards | Empty/loading/error vary by widget | Heading order, rail/nav, touch targets | E3 |
| SUPPLY | E/P | R/V | R/V | Operational pages largely shared-component designed | Highest risk of assembled/admin-template appearance | Listing/leads/application/viewing states | Capability communication, long forms, responsive actions | E4 |
| PROVIDER | E | A/V | R/V | No dedicated Figma evidence | Marketplace and workspace must feel like one product | Profile completeness, quote/review/complaint/appeal states | Uploads, rating controls, long badges | E5 |
| INSPECTOR | E | A/V | R/V | No dedicated Figma evidence | Functional inspection widgets | Assigned/declined/cancelled/reassigned/unavailable | Evidence upload labels; preserve authorization | E5 |
| FINANCE-OPS | P | A/V | R/V | Financing test explicitly calls selector Figma-aligned; plans define UX | Calm/trustworthy language, dense state panels | Provider unavailable, funding, consent, documents, offers | Status semantics, upload/error navigation | E3/E6 |
| MESSAGES | D/P | A/V | R/V | Empty inbox test calls it Figma-style | Custom two-pane experience | Empty, unread, sending, retry/failure | Mobile pane navigation, composer labels, long content | E3/E5 |
| ADMIN | F | R/V | R/V | No customer-product Figma expectation | Dense operational cards/lists; consistency debt | Queues, moderation, no-data, failures | Responsive alternatives, action grouping, focus order | E6 |
| SETTINGS | E | A/V | R/V | Shared-component designed | Forms and account shells need grouping/rhythm | Save success/failure and preference loading | Error association, keyboard, field purpose | E3 |

## Complete route inventory

### PUB-MARKETING — `P / A desktop / A-V mobile`

- `/`
- `/for-professionals`
- `/about`
- `/contact`
- `/help`

### PUB-PROPERTY — `P / A-V desktop / R-V mobile`

- `/properties`
- `/properties/[slug]`
- `/properties/[slug]/request-inspection`
- `/saved-properties`
- `/apply/[propertyId]`

### PUB-TRUST — `E / A desktop / A-V mobile`

- `/privacy`
- `/terms`
- `/refunds`
- `/safety`
- `/fraud-reporting`
- `/listing-standards`
- `/verification-standards`
- `/escrow-disclosure`
- `/financing-disclosure`
- `/data-deletion`

### AUTH — `P / A-V desktop / R-V mobile`

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`

### ONBOARDING — `E / A-V desktop / R-V mobile`

- `/onboarding/role-setup`
- `/verification`
- `/verification/new`
- `/verification/property/[propertyId]/new`

### BUYER — `D-P / A-V desktop / R-V mobile`

- `/dashboard`
- `/dashboard/notifications`
- `/dashboard/inspections`
- `/dashboard/inspections/[id]`
- `/dashboard/construction`
- `/dashboard/construction/projects/[slug]`
- `/dashboard/transactions`
- `/dashboard/transactions/[id]`

### SUPPLY — `E-P / R-V desktop / R-V mobile`

- `/properties/new`
- `/dashboard/properties`
- `/dashboard/properties/[propertyId]/edit`
- `/dashboard/properties/[propertyId]/walkthroughs`
- `/dashboard/leads`
- `/dashboard/leads/[id]`
- `/dashboard/applications/[applicationId]`
- `/dashboard/construction/operations`

### MESSAGES — `D-P / A-V desktop / R-V mobile`

- `/dashboard/messages`
- `/dashboard/messages/[id]`

### SETTINGS — `E / A-V desktop / R-V mobile`

- `/settings/profile`
- `/settings/notifications`

### PUBLIC SERVICES / PROVIDER — `E / A-V desktop / R-V mobile`

- `/services`
- `/services/providers/[slug]`
- `/dashboard/services`
- `/dashboard/services/reviews`
- `/dashboard/services/bookings/[bookingId]/review`
- `/dashboard/services/complaints`
- `/dashboard/services/complaints/[id]`
- `/dashboard/artisan`
- `/dashboard/artisan/profile`
- `/dashboard/artisan/portfolio`
- `/dashboard/artisan/quote-requests`
- `/dashboard/artisan/reviews`
- `/dashboard/artisan/complaints`
- `/dashboard/artisan/complaints/[id]`
- `/dashboard/artisan/appeals`
- `/dashboard/artisan/appeals/[id]`

### INSPECTOR — `E / A-V desktop / R-V mobile`

- `/dashboard/inspector`
- `/dashboard/inspector/assignments`
- `/dashboard/inspector/assignments/[id]`

### FINANCE-OPS — `P / A-V desktop / R-V mobile`

- `/dashboard/transactions/[id]/escrow`
- `/dashboard/transactions/[id]/financing`
- `/dashboard/financing`
- `/dashboard/financing/apply`
- `/dashboard/financing/[id]`

### ADMIN — `F / R-V desktop / R-V mobile`

- `/admin`
- `/admin/verifications`
- `/admin/services`
- `/admin/services/providers`
- `/admin/services/providers/[id]`
- `/admin/services/quote-requests`
- `/admin/services/reviews`
- `/admin/services/reviews/[id]`
- `/admin/services/complaints`
- `/admin/services/complaints/[id]`
- `/admin/services/appeals`
- `/admin/services/appeals/[id]`
- `/admin/inspections`
- `/admin/inspections/requests`
- `/admin/inspections/inspectors`
- `/admin/inspections/reports`
- `/admin/inspections/walkthroughs`
- `/admin/construction`
- `/admin/payments`
- `/admin/payments/escrow`
- `/admin/financing`
- `/admin/financing/[id]`

## Figma fidelity evidence

- `/dashboard`: component test describes the buyer dashboard as Figma-aligned; direct source-node comparison is still unavailable, so it is not yet marked `MATCH`.
- `/dashboard/financing/apply`: test describes the selector as Figma-aligned, while the committed Sprint 14.2 UX plan documents layout and state intent.
- `/dashboard/messages`: test describes the empty inbox state as Figma-style.
- Public B2C and `/for-professionals` have an approved, shipped visual direction with bespoke artwork and reduced-motion handling. Their current implementation is treated as acceptable product evolution pending source comparison.
- Remaining operational/admin surfaces have no repository evidence of dedicated design screens and are classified `E` or `F`, not falsely represented as Figma matches.

## E1–E7 delivery map

1. **E1 shared foundations:** canvas/surface defaults, visible scroll affordance, modal keyboard behavior, form error semantics, axe harness, shared empty/error/loading primitives, viewport matrix.
2. **E2 public/auth/onboarding:** marketing rhythm, intentional zero inventory, property discovery/detail/mobile filters, trust content, auth and continuation, onboarding.
3. **E3 buyer/finance/settings:** dashboard hierarchy, saved/inquiries/applications/viewings, notifications/messages, finance, profile/settings.
4. **E4 landlord/agent:** managed properties, create/edit, leads, applications, viewings, capability-aware actions.
5. **E5 provider/inspector:** public services, artisan workspace, quote/review/governance, inspection assignments/evidence.
6. **E6 admin/data-dense:** moderation, verification, inspection, construction, payment/escrow/financing queues and responsive data patterns.
7. **E7 final accessibility/responsive:** required viewport evidence, keyboard-only flows, focus/error navigation, reduced motion, contrast, 200% zoom, touch targets, axe/Lighthouse, cross-role regression.

## Guardrails

- Keep property detail at the Sprint D three-call sequence and one similar-inventory request.
- Do not alter authorization, signed-document, role-grant, auth, or backend contracts for visual convenience.
- Do not introduce fake public inventory or customer data.
- Do not merge `wip/launch-closure-features` or apply/drop `stash@{0}`.
- Each batch gets its own focused PR, full frontend gate, visual evidence, deployment, and regression check.
