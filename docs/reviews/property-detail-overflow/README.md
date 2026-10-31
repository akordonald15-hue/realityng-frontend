# Property detail overflow review

The main grid item's automatic minimum width allowed the similar-properties
carousel to expand the whole page to 1348px on mobile. Adding `min-w-0` to its
`StaggerReveal` lets the column shrink while retaining the carousel's own scroll.

Screenshots use the real production build and isolated synthetic API fixtures,
with production fonts loaded and reduced motion enabled. No beta accounts,
production data, or credentials are used. The baseline is frontend main
`d051cf060f9c4494495c7ceb3ec6cb0064b8674e`; the only application change is the class.

| Viewport | Before document width | After document width |
| --- | --- | --- |
| 320 | Not separately measured | 320 |
| 360 | 1348 | 360 |
| 375 | Not separately measured | 375 |
| 390 | 1348 | 390 |
| 768 | Not separately measured | 768 |
| 1024 | Not separately measured | 1024 |
| 1440 | 1440 | 1440 |

The 1440px full-page screenshots are pixel-identical (1440 × 4540).
All seven corrected viewport tests pass, including independent carousel scrolling
on mobile/tablet. The browser test fails on the uncorrected 360px and 390px builds.

- [Before at 390px](before-390.png)
- [After at 390px](after-390.png)
- [Recorded measurements](validation.json)

Run `npm run build`, then
`npx playwright test --config=playwright.layout.config.ts`.
CI runs this regression against the production standalone build and uploads
screenshots, measurements and the Playwright report as `property-detail-layout`.

These are pre-merge review results. The correction is not deployed by this PR.
