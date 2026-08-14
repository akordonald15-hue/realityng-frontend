# RealityNG Sprint 14.1 Frontend Implementation Report

Status: Implementation branch  
Branch: `feature/sprint-14.1-escrow`

## Summary

The frontend adds escrow visibility and operations surfaces on top of the existing transaction dashboard.

## Routes Added

- `/dashboard/transactions/[id]/escrow`
- `/admin/payments`
- `/admin/payments/escrow`

## Components Added

- `EscrowStatusBadge`
- `EscrowSimpleStatusBadge`

## API Client Additions

The payments API client now includes typed escrow records, providers, funding events, conditions, releases, refunds, settlements and reconciliation records.

Implemented client calls:

- `getTransactionEscrow`
- `listEscrows`
- `requestEscrowRelease`
- `requestEscrowRefund`
- `approveEscrowRelease`
- `confirmEscrowRelease`

## Wording Rules Applied

The UI avoids saying:

- RealityNG holds money
- payment guaranteed
- escrow secured

The UI uses safer language:

- provider-confirmed funding
- release requested
- settlement confirmed
- refund confirmed

## Known Limitations

- Admin detail actions are represented through backend APIs but the frontend admin queue is currently read-first.
- Live provider activation is intentionally absent.
- Sprint 14.2 financing was not started.

## Validation Notes

- Lint: passed.
- Typecheck: passed.
- Tests: 44 test files passed, 86 tests passed.
- Mock build: passed with `NEXT_PUBLIC_USE_MOCKS=true`.
- Real API build: passed with `NEXT_PUBLIC_USE_MOCKS=false` and `NEXT_PUBLIC_API_BASE_URL=https://api.realityng.com/api/v1`.
