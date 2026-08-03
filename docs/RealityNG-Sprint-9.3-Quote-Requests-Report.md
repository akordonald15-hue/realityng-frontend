# RealityNG Sprint 9.3 Quote Requests and Customer Enquiries

## Executive Summary

Sprint 9.3 activates the first customer-to-provider interaction for the verified services marketplace. Public users can open an approved provider profile and submit a quotation request. Providers can view and manage requests from the artisan dashboard, while admins can monitor service quote requests from the admin area.

This sprint remains strictly lead-generation only. It does not introduce bookings, payments, messaging, reviews, complaints, notifications delivery, or calendar scheduling.

## Screens and Routes

Public:

- `/services/providers/[slug]`
  - Active `Request Quote` button.
  - Quote request modal.
  - Submission success state.

Provider dashboard:

- `/dashboard/artisan/quote-requests`
  - Quote request list.
  - Search, status filter, and ordering.
  - Mark viewed, mark responded, and close actions.

Admin:

- `/admin/services/quote-requests`
  - Admin quote request queue.
  - Search, status filter, and ordering.
  - Close action for moderation.

Updated existing screens:

- `/dashboard/artisan`
  - Added Quote Requests entry point.
- `/admin/services/providers`
  - Added Quote Requests admin entry point.

## Components Added

- `RequestQuoteButton`
- `QuoteRequestsList`
- `QuoteRequestStatusBadge`

## API Client Additions

- `createQuoteRequest`
- `listProviderQuoteRequests`
- `markQuoteRequestViewed`
- `markQuoteRequestResponded`
- `markQuoteRequestClosed`
- `adminListQuoteRequests`
- `adminCloseQuoteRequest`

## Mock Mode

`NEXT_PUBLIC_USE_MOCKS=true` remains supported through mock quote request data and mock status transitions. Mock functions are isolated in `src/mocks/mock-services.ts` and are not used when real API mode is enabled.

## Customer Experience

The quote request modal collects:

- service category
- preferred contact method
- project title
- project description
- customer name
- budget range
- phone
- email
- property address
- state
- LGA
- preferred start date

After submission, the user sees:

> Your request has been sent.

> The provider will contact you shortly using your preferred contact method.

## Validation Results

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: 32 test files passed, 56 tests passed
- `NEXT_PUBLIC_USE_MOCKS=true npm run build`: passed
- `NEXT_PUBLIC_USE_MOCKS=false NEXT_PUBLIC_API_BASE_URL=https://api.realityng.com/api/v1 npm run build`: passed

## Tests Added or Updated

- Updated public provider profile test to cover quote request modal submission.
- Added quote request list test for provider status action.

## Jira-Ready Task Breakdown

- Frontend: activate Request Quote on public provider profile.
- Frontend: build quote request modal with form, progress state, server error handling, and success state.
- Frontend: add provider quote request dashboard route.
- Frontend: add admin quote request queue route.
- Frontend: add quote request status badge and reusable list component.
- Frontend: extend services API client and mock service layer.
- Frontend: add/adjust tests for public submission and provider status actions.

## Known Limitations

- Provider cannot send a structured quote proposal yet.
- No booking or scheduling is created.
- No payments.
- No messaging/chat.
- No reviews or complaints.
- No email, SMS, push, or in-app notification delivery.

## Future Work

Possible next steps:

- Provider quote response workflow.
- Customer quote status page.
- Booking workflow after a quote is accepted.
- Notification delivery using Sprint 9.3 events.

