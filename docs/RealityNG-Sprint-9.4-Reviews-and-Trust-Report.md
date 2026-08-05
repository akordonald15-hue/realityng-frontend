# RealityNG Sprint 9.4 Reviews, Ratings and Trust Signals

## Executive Summary

Sprint 9.4 adds the frontend review and rating experience for the verified services marketplace. Public provider profiles now display rating summaries, published reviews, provider responses, and review-derived trust signals. Customers can submit booking-linked reviews, providers can manage and respond to reviews, and admins can moderate review content.

This sprint does not introduce payments, messaging, notification delivery, complaint resolution, subscriptions, featured placements, or advanced booking workflows.

## Screens and Routes

Public:

- `/services/providers/[slug]`
  - Rating summary.
  - Review list.
  - Provider response display.
  - Review-derived trust signals.
  - Report/flag action.

Customer dashboard:

- `/dashboard/services/bookings/[bookingId]/review`
  - Booking-linked review form.
  - Overall and dimension ratings.
  - Duplicate-submit prevention.
  - Submission success state.

- `/dashboard/services/reviews`
  - Customer review history.
  - Status badges.
  - Edit availability based on backend policy.

Provider dashboard:

- `/dashboard/artisan/reviews`
  - Provider review list.
  - Rating summary.
  - Provider response action.
  - Flag/report action.

Admin:

- `/admin/services/reviews`
  - Review moderation queue.
  - Search and status filters.

- `/admin/services/reviews/[id]`
  - Review detail.
  - Booking context.
  - Provider and customer context.
  - Publish, hide, restore, remove, and mark disputed actions.

Updated existing screens:

- `/dashboard/artisan`
  - Added Reviews entry point.
- `/admin/services/providers`
  - Added Reviews admin entry point.

## Components Added

- `StarRating`
- `RatingSummary`
- `ReviewCard`
- `ReviewForm`
- `ReviewStatusBadge`
- `ProviderReviewsSection`
- `ReviewModerationList`

## API Client Additions

- `listServiceReviews`
- `createServiceReview`
- `listMyServiceReviews`
- `listProviderServiceReviews`
- `respondToServiceReview`
- `flagServiceReview`
- `adminListServiceReviews`
- `adminGetServiceReview`
- `adminModerateServiceReview`

## Mock Mode

`NEXT_PUBLIC_USE_MOCKS=true` remains supported through mock review data and deterministic mock status transitions.

Mock mode covers:

- eligible completed booking;
- review submission;
- public published reviews;
- provider response;
- review flagging;
- admin moderation states;
- rating summary display.

Mock functions remain isolated in `src/mocks/mock-services.ts` and are not used when real API mode is enabled.

## Public Provider Profile

The public profile now shows:

- average rating;
- published review count;
- recommendation percentage;
- dimension ratings;
- review-derived trust signals;
- review cards;
- provider responses;
- review empty state.

Public UI does not display:

- customer contact details;
- internal moderation notes;
- private fraud metadata;
- private verification documents;
- hidden, removed, disputed, flagged, or pending reviews.

## Customer Review Flow

The review form includes:

- overall rating;
- review title;
- comment;
- recommendation choice;
- quality rating;
- punctuality rating;
- communication rating;
- value rating.

The form includes accessible labels, validation messages, loading states, and duplicate-submit prevention.

## Provider Review Management

Providers can:

- view reviews tied to their profile;
- see rating summary;
- respond once to a published review;
- flag/report a review.

Providers cannot:

- edit customer ratings;
- delete reviews;
- publish reviews;
- hide reviews;
- change rating aggregates.

## Admin Moderation

Admins can:

- search and filter reviews;
- inspect review details;
- view booking and provider context;
- publish;
- hide;
- restore;
- remove;
- mark disputed.

Moderation actions use dialog/form controls with explicit reasons where required.

## Validation Results

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed, 34 files and 58 tests

Build results are recorded in the final Sprint 9.4 closure report after mock-mode and real-API production builds are rerun.

## Tests Added or Updated

- Public provider profile review rendering.
- Review form submission.
- Provider response flow.

## Security Notes

- Normal users do not see admin review routes in navigation.
- Public review content is rendered as text, not raw HTML.
- Mock and real API paths remain separated by the existing environment switch.
- Provider responses and review flags use backend authorization.

## Known Limitations

- Review eligibility depends on the backend completed service booking lifecycle.
- No full complaints workflow.
- No notification delivery.
- No payments or booking scheduling.
- No review analytics dashboard beyond the review-specific surfaces required for Sprint 9.4.

## Sprint 9.5 Readiness

Sprint 9.5 can build broader service dashboards and operational analytics using the review, quote, provider, and booking foundations already present.

