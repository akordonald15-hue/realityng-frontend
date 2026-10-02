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

## E2b public and onboarding closure

| Surface | Classification | E2b finding and disposition |
|---|---|---|
| `/` | Partially Figma-designed / approved evolution | Hero and marketing artwork retained. Zero-inventory presentation remains data-honest. Active search tabs now use an AA-safe semantic brand surface. |
| `/for-professionals` | Partially Figma-designed / approved evolution | Approved cardless four-step process, artwork, motion, and reduced-motion behavior retained. No replacement redesign was justified. |
| `/properties` | Engineer-designed / shared-component | Existing deliberate loading, empty-marketplace, filtered-empty, and error states retained. Responsive overflow passed at 1440, 1280, 1024, 768, 390, and 375 px. |
| `/properties/[slug]` | Partially Figma-designed / approved evolution | No-photo, unavailable map/walkthrough, archived, and similar-listing states remain explicit. The performance contract remains one similar-inventory request and three total property-detail API calls. |
| Public navigation | Shared component | Mobile drawer now receives and traps focus, closes with Escape, restores focus, exposes current-page semantics, and continues to lock background scroll. |
| Footer | Shared component | Semantic grouping and approved cityscape retained; keyboard focus indication added to every footer link. |
| Public assistant | Engineer-designed / shared-component | Phone teaser suppression retained. The opened panel now receives input focus, restores launcher focus on close, respects safe-area inset, and exposes a named region. |
| `/onboarding/role-setup` | Engineer-designed / shared-component | Reframed as optional professional setup on the semantic canvas. Internal admin roles are excluded, approval wording is accurate, loading/error/retry states are intentional, and safe `next` continuation is preserved without automatic role grants. |
| Professional entry points | Shared flow | Existing `role` + safe `next` propagation retained for homepage, navigation, and professional CTAs; no auth or authorization contract changed. |

E2b automated evidence: ten desktop/mobile axe scans passed with no serious or critical WCAG A/AA violation. Public overflow passed across the required six widths. Mobile navigation and assistant focus behavior are covered in both component and Playwright tests. Property-detail unit coverage continues to assert exactly one similar-property inventory request.

## E3 Buyer route audit

| Buyer surface | Design source | E3 classification | Primary finding / resolution |
|---|---|---|---|
| `/dashboard` | Partial Figma | Polished | Existing overview, discovery entry, metrics, request rail, saved rail, activity, loading, empty, and error behavior retained. Copy and display hierarchy were normalized without changing queries or tab behavior. |
| `/saved-properties` | Partial Figma / shared components | Polished | Active cards and privacy-preserving unavailable tombstones retained. Page now uses the authenticated Buyer shell; removal continues to use property ID and invalidates both favorites and dashboard data. |
| Buyer inquiries and viewings on `/dashboard` | Engineer-designed | Usable but product-constrained | Status, property context, date/time, next action, cancel/apply states, loading, empty, and errors are present. There are no dedicated Buyer inquiry/viewing list routes; this remains product debt rather than a fabricated workflow. |
| `/apply/[propertyId]` | Partial Figma | Polished | Annual-income contract, additional-income rows, validation, pending state, API failure, and mobile single-column order remain covered. No financial contract changed. |
| `/dashboard/applications/[applicationId]` | Engineer-designed shared Buyer/reviewer view | Polished | Buyer/reviewer variants, annual versus legacy monthly labels, status actions, and owner-note isolation remain test-covered. |
| `/dashboard/messages`, `/dashboard/messages/[id]` | Partial Figma | Polished | Responsive inbox/thread states, unread count, retry, optimistic/pending send, long-text wrapping, keyboard send, realtime isolation, and scroll-to-latest retained. Outgoing-message contrast strengthened. |
| `/dashboard/notifications` | Engineer-designed | Polished | Read/unread distinction no longer relies on color alone; body/timestamp readability and empty state improved. Existing realtime and preferences contracts retained. |
| `/settings/profile` | Engineer-designed | Polished | Profile, verification state, validation, loading, error, success, and cancellation are present. Production phone behavior is unchanged; Nigerian-phone WIP remains excluded. |
| `/settings/notifications` | Engineer-designed | Polished | Preference grouping, pressed-state semantics, loading, and update failure are present. No unsupported password/destructive settings were invented. |
| `/dashboard/transactions`, `/dashboard/transactions/[id]` | Engineer-designed / functional | Usable but product-constrained | List loading/error/empty hierarchy and semantic surfaces improved. Detail continues to expose only API-supported milestones, proofs, escrow, financing, and status actions; backend financial authorization remains authoritative. Property titles are unavailable in the list contract, so opaque identifiers remain tracked debt. |
| `/dashboard/financing`, `/dashboard/financing/apply`, `/dashboard/financing/[id]` | Partial Figma | Polished | Existing product selection, draft/application status, loading, empty, and API-error surfaces retained. No unsupported payment workflow added. |
| `/dashboard/inspections`, `/dashboard/inspections/[id]` | Engineer-designed | Usable | Buyer request tracking, private report states, and authorization remain intact. Broader Inspector workspace polish belongs to E5. |
| `/dashboard/construction`, `/dashboard/construction/projects/[slug]` | Engineer-designed / functional | Usable | Reachable stakeholder views remain data-driven. Full construction workspace polish remains E4/E5 scope. |

### E3 authenticated shell decisions

- Buyer-only mobile navigation now exposes Home, Saved, Messages, Alerts, and Profile with `aria-current`, 64 px touch targets, a semantic active surface, and safe-area padding.
- The navigation is withheld from admin, approved supply, and approved professional personas so E3 does not redesign later-role workspaces.
- Buyer pages reserve bottom space so fixed navigation cannot cover content.
- The authenticated assistant moves above Buyer navigation, uses safe-area-aware panel height, focuses its composer when ready, and restores focus to its launcher on close.
- No new data request, chart library, backend contract, security rule, or role capability was introduced.

## E4 Landlord, Agent, and property-management route audit

| Professional surface | Design source | E4 classification | Primary finding / resolution |
|---|---|---|---|
| Shared authenticated shell | Engineer-designed | Polished | Added persistent Landlord/Agent identity, desktop workspace navigation, and mobile Home/Properties/Leads/Messages/Profile navigation. Active-route semantics, safe-area spacing, and assistant offset are shared without reusing Buyer priorities blindly. |
| `/dashboard` | Partial Figma | Polished | Landlord and Agent identity is explicit; overview, metrics, requests, inventory, messages, saved, recent, loading, empty, and error states retain the existing data contract. Copy and section hierarchy were normalized. |
| `/dashboard/properties` | Partial Figma / shared components | Polished | Status/search/sort filters, pagination, approved/draft/pending/rejected/archived states, retry, and empty actions are present. Canonical edit links continue to use slugs. Assignments without `can_manage_listing` now explain their view-only state. |
| `/properties/new` | Partial Figma | Polished | Five-step Details/Location/Features/Media/Review workflow, progressive unlocking, field validation, draft save, submission, and responsive controls remain intact. |
| `/dashboard/properties/[propertyId]/edit` | Partial Figma | Polished | The shared segment is decoded as the canonical property slug. Loading, retryable API/permission failures, populated defaults, save feedback, and media management remain intact. |
| Property media manager | Engineer-designed | Polished | Upload, caption, lazy preview, cover, reorder, delete, loading, empty, and mutation-pending states are present. No upload/security or first-cover contract changed. |
| `/dashboard/leads`, `/dashboard/leads/[id]` | Engineer-designed | Usable with backend/product debt | Search, pipeline, priority, metrics, status, notes, activity, retry, and empty states are present. The API exposes pagination but the list has no pagination controls; assignment still requires a raw user ID because no eligible-assignee directory contract exists. These were not masked with fake UI. |
| Applications on dashboard and `/dashboard/applications/[applicationId]` | Engineer-designed | Polished | Applicant/property context, yearly income, clearly labelled legacy monthly income, review actions, owner notes, and applicant/reviewer privacy variants remain backend-authorized through `can_manage_application`. |
| Viewing management on `/dashboard` | Engineer-designed | Polished | Requested/scheduled/completed/cancelled states and management actions remain gated by the backend `can_manage_viewing` signal. |
| `/dashboard/messages`, `/dashboard/messages/[id]` | Partial Figma | Polished | E3 message hierarchy, sending/retry behavior, long-content handling, mobile navigation, and WebSocket isolation are shared by professional personas. |
| `/dashboard/notifications` and `/settings/notifications` | Engineer-designed | Polished | Read/unread semantics, action clarity, preference loading, and update failures use the shared E3 quality baseline. |
| `/verification`, `/verification/new`, `/verification/property/[propertyId]/new` | Engineer-designed | Usable | Status, document submission, loading, and failure states remain data-driven. Signed private-document behavior and upload authorization were not changed. |
| `/settings/profile` | Engineer-designed | Polished | Contact/profile/verification information uses the shared authenticated shell. Nigerian-phone WIP remains excluded. |

### E4 capability and performance decisions

- Professional navigation exposes listing and CRM destinations but does not add transaction or payment authority.
- `MANAGE_LISTING`, application, and viewing affordances continue to depend on backend response signals; frontend presentation is not treated as authorization.
- No dashboard-query experiment, new request, table/chart library, cache, or backend contract was introduced.
- Provider, Inspector, Artisan, Admin, and construction workspace redesign remains E5+ scope.

## E5 Provider, Artisan, and Inspector route audit

| Surface | Design source | E5 classification | Finding / resolution |
|---|---|---|---|
| Shared Provider shell | Engineer-designed | Polished | Added Provider identity and responsive Overview/Profile/Portfolio/Requests/Messages navigation. Mobile safe-area and assistant offset now match the shared RealityNG shell. |
| `/dashboard/artisan` | Engineer-designed | Polished | Profile readiness, moderation status, metrics, recent quote requests, reviews, reminders, activity, loading, first-profile, and retryable error states are intentionally grouped on semantic surfaces. |
| `/dashboard/artisan/profile` | Engineer-designed | Polished | Profile identity, contact fields, trades, experience, service areas, moderation state, portfolio, save/submit feedback, and fee-product limitation are explicit. Fixed live paginated-list handling for trades and service areas. |
| `/dashboard/artisan/portfolio` | Engineer-designed | Polished | Upload validation, pending state, empty state, cover selection, deletion, errors, responsive gallery, and public/private media distinction are present. Fixed live paginated-list handling. |
| `/dashboard/artisan/quote-requests` | Engineer-designed | Polished with product debt | Search, status, ordering, customer/property context, dates, budget, actions, empty, loading, and errors are present. Metadata is now a labelled responsive definition list. The API exposes pagination but this screen still has no pagination controls. |
| Artisan reviews, complaints, and appeals | Engineer-designed | Usable | Existing governance lists/details, empty states, and moderation status remain in scope and use the shared Provider shell. These are secondary beta paths and retain their existing forms. |
| Provider messages, notifications, verification, and settings | Shared components | Polished | Uses the E3 messaging/notification quality baseline and shared verification/settings flows without weakening message or private-document authorization. |
| Shared Inspector shell | Engineer-designed | Polished | Added Inspector identity and responsive Overview/Assignments/Messages/Alerts/Profile navigation with active-route semantics and mobile assistant clearance. |
| `/dashboard/inspector` | Engineer-designed | Polished | Active assignments, recent work, intentional empty states, loading, and a retry-oriented role/error explanation are visible without decorative noise. |
| `/dashboard/inspector/assignments` | Engineer-designed | Polished | Accept/decline actions, labelled decline reason, pending protection, mutation errors, loading, empty, and list errors are explicit. |
| `/dashboard/inspector/assignments/[id]` | Engineer-designed | Polished | Property context, status, report, timeline, evidence, upload constraints, pending/error feedback, and report submission are grouped by operational priority. Report/timeline requests now wait for an authorized assignment response. |
| Stale Inspector assignments | Security-designed state | Polished | Declined, cancelled, and reassigned access remains fail-closed. The UI presents one non-enumerating unavailable state and never renders report or evidence tools. |
| Inspector profile/settings | Shared component | Usable | General profile and notification settings are available. There is no dedicated inspector-profile editing API or route in the current product contract. |

### E5 product and performance boundaries

- The current provider contract models services through trade categories, experience, service areas, profile status, and portfolio; it has no separate service-SKU CRUD or availability-calendar workflow.
- Quote requests are enquiries with lifecycle actions, not priced quote documents. No unsupported pricing or payment UI was invented.
- Inspector reports and evidence live inside assignment detail; there is no separate Inspector report index or evidence deletion contract.
- Provider list normalization accepts both the backend's paginated response and existing unpaginated mocks without adding requests.
- Inspector detail avoids report and timeline calls until the assignment request succeeds, reducing unauthorized/stale-route amplification from three requests to one.
- No new UI library, cache, polling loop, backend permission, signed-URL behavior, or upload MIME contract was introduced.
