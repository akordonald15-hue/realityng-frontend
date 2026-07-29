# RealityNG Google Maps Frontend Setup

Sprint 8 adds Google Maps as an enhancement to property browsing. The application must continue to work if Google Maps is unavailable, over quota, blocked by key restrictions, or not configured.

## Required Frontend Environment Variable

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

This is a browser API key, so it is public by design. It must be restricted in Google Cloud.

## Google Cloud Configuration

Enable only the required APIs:

1. Maps JavaScript API.
2. Places API only when nearby-place search is actively used.
3. Geocoding API only when backend or admin geocoding workflows are approved.

Recommended browser key restrictions:

```text
https://realityng.com/*
https://www.realityng.com/*
https://*.vercel.app/*
http://localhost:3000/*
http://127.0.0.1:3000/*
```

Remove broad preview or localhost referrers from production-only keys when a separate staging key exists.

## Production Expectations

The production frontend should use:

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=https://api.realityng.com/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<restricted-browser-key>
```

Do not add backend secrets such as `DATABASE_URL`, `REDIS_URL`, MinIO secrets, or provider API keys to the frontend.

## Fallback Behavior

If the key is missing or invalid:

1. Browse and property detail pages still render.
2. Property lists and filters still work.
3. The map panel shows a controlled fallback instead of crashing.
4. Users can still open listed properties from the fallback panel.

## Privacy Rules

Frontend map UI must use only public API fields:

1. `latitude`
2. `longitude`
3. `location_precision`
4. `approximate_location`
5. `display_location`
6. `location_metadata`

Do not derive or display exact addresses from private/admin fields in public map UI.
