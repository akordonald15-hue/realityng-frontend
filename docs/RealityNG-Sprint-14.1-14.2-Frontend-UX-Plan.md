# RealityNG Sprint 14.1 and 14.2 Frontend UX Plan

Status: Planning only  
Scope: escrow UX and property financing UX. No implementation in this document.

## UX Principle

Financial workflows must feel clear, calm, and trustworthy. The interface should explain what RealityNG knows, what the partner has confirmed, and what still requires action. It must not imply that RealityNG directly holds funds or approves loans unless that becomes legally true.

Use precise labels:

- "Payment proof submitted"
- "Escrow funding pending"
- "Escrow funding confirmed by partner"
- "Release conditions pending"
- "Financing application submitted"
- "Partner review in progress"
- "Offer received from financing partner"

Avoid:

- "Guaranteed"
- "Approved" before partner confirmation
- "RealityNG holds your money" unless legally approved
- public display of private financial status

## Existing Sprint 14 Frontend Foundation

Current Sprint 14 adds:

- `/dashboard/transactions`
- `/dashboard/transactions/[id]`
- transaction API client
- payment proof upload/review surfaces
- status badges

Sprint 14.1 and 14.2 should extend these routes rather than create a disconnected finance portal.

## Sprint 14.1 Escrow Routes

| Route | Purpose | User |
| --- | --- | --- |
| `/dashboard/transactions/[id]/escrow` | escrow status, funding state, release conditions | buyer/seller/authorized manager |
| `/dashboard/transactions/[id]/escrow/conditions` | detailed release checklist | buyer/seller/admin-visible |
| `/dashboard/transactions/[id]/escrow/releases` | release/refund history | buyer/seller/admin-visible |
| `/admin/payments/escrow` | escrow operations queue | admin |
| `/admin/payments/escrow/[id]` | escrow detail, reconciliation, manual actions | admin |

## Sprint 14.1 Escrow Components

- `EscrowStatusBadge`
- `EscrowTimeline`
- `EscrowFundingPanel`
- `EscrowConditionChecklist`
- `EscrowReleasePanel`
- `EscrowRefundPanel`
- `EscrowDisputeNotice`
- `EscrowReconciliationSummary`
- `EscrowAdminActionDialog`
- `PartnerConfirmationCard`

## Escrow UX Flow

### Buyer

1. Opens transaction.
2. Sees whether escrow is available.
3. Starts escrow where policy allows.
4. Receives partner funding instructions or confirmation.
5. Tracks release conditions.
6. Confirms release only when backend says it is eligible.

### Seller / Owner / Assigned Manager

1. Opens transaction.
2. Sees funding status.
3. Sees required release conditions.
4. Cannot self-release funds unless policy allows.
5. Sees dispute/release/refund history.

### Admin

1. Reviews escrow queue.
2. Filters by status, provider, dispute, reconciliation mismatch.
3. Opens escrow detail.
4. Reviews provider events, conditions, transaction parties, and proof history.
5. Takes manual action with reason where allowed.

## Escrow Empty, Loading, And Error States

- No escrow: explain that escrow is not yet started.
- Provider unavailable: show a non-blocking message and preserve transaction detail.
- Reconciliation mismatch: show admin-only warning.
- Funding pending: show that proof/funding is not yet partner-confirmed.
- Dispute active: show that release is paused.

## Sprint 14.2 Financing Routes

| Route | Purpose | User |
| --- | --- | --- |
| `/dashboard/financing` | applicant financing overview | authenticated user |
| `/dashboard/financing/apply` | product selection and application start | authenticated user |
| `/dashboard/financing/[id]` | application status, documents, offers | applicant |
| `/dashboard/transactions/[id]/financing` | transaction-linked financing path | buyer/applicant |
| `/admin/financing` | financing application queue | admin |
| `/admin/financing/[id]` | admin review and partner handoff | admin |

## Sprint 14.2 Financing Components

- `FinancingProductCard`
- `FinancingEligibilityNotice`
- `FinancingApplicationForm`
- `FinancingConsentPanel`
- `FinancingDocumentChecklist`
- `FinancingDocumentUploader`
- `FinancingStatusTimeline`
- `FinancingOfferCard`
- `FinancingPartnerStatusCard`
- `FinancingAdminQueue`
- `FinancingAdminReviewPanel`

## Financing UX Flow

### Applicant

1. Selects rent finance or mortgage product.
2. Reviews eligibility and required documents.
3. Creates draft application.
4. Grants data-sharing consent.
5. Uploads required documents.
6. Submits application.
7. Tracks status.
8. Reviews partner offer if received.
9. Accepts or declines partner offer.

### Admin

1. Reviews application queue.
2. Verifies completeness.
3. Requests more information if needed.
4. Submits to financing partner where approved.
5. Records or receives partner decision.
6. Ensures applicant-facing copy does not expose internal notes.

## Privacy Boundaries

Never show to public users:

- financing application status
- uploaded financial documents
- income/employment data
- partner underwriting notes
- rejected application reason where partner policy forbids it

Show to applicant only:

- own application status
- own document checklist
- own offers
- approved applicant-facing messages

Show to admin only:

- internal review notes
- partner submission payload summary
- reconciliation or exception status

## API Client Plan

Add typed clients for:

- escrow detail
- escrow conditions
- release/refund requests
- admin escrow queues
- financing products
- financing applications
- financing documents
- financing offers
- admin financing queues

All mutation responses should refetch the authoritative backend status. The frontend must not infer financial state after a button click.

## Responsive Design

Mobile:

- status timeline becomes vertical
- admin tables become card lists or horizontal overflow with visible affordance
- financial action buttons stay visible but never cover form fields
- document uploader supports camera/file picker

Desktop:

- two-column transaction detail
- sticky right-side status/action panel
- admin queue with filters and sortable columns

## Accessibility

- all status badges include text labels
- progress timelines use semantic lists
- dialogs trap focus
- forms have labels and validation messages
- upload controls announce selected files and errors
- color is not the only status indicator

## Test Plan

Frontend tests:

- escrow status rendering
- release condition checklist rendering
- provider unavailable error state
- admin escrow queue protection
- financing draft form validation
- consent required before submission
- document checklist states
- offer accept/decline rendering
- applicant/admin privacy boundaries
- mock mode responses
- real API build

## Recommended Build Order

1. Extend transaction detail with escrow read-only status.
2. Add escrow condition and timeline components.
3. Add admin escrow queue.
4. Add financing product/application routes.
5. Add financing document and consent UI.
6. Add offer display.
7. Add partner/admin operations after backend endpoints stabilize.

