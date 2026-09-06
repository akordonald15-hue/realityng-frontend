export const motionEase = {
  standard: "power2.out",
  emphasized: "power3.out",
} as const;

export const motionDurations = {
  reveal: 0.92,
  hero: 0.86,
  imageSettle: 1.12,
  cardReveal: 0.84,
} as const;

export const fadeUp = {
  from: { autoAlpha: 0, y: 40 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.reveal,
    ease: motionEase.emphasized,
    y: 0,
  },
} as const;

export const heroReveal = {
  from: { autoAlpha: 0, y: 36 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.hero,
    ease: motionEase.emphasized,
    y: 0,
  },
} as const;

export const imageSettle = {
  from: { autoAlpha: 0.9, scale: 1.035 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.imageSettle,
    ease: motionEase.standard,
    scale: 1,
  },
} as const;

export const staggerChildren = {
  amount: 0.12,
  duration: motionDurations.cardReveal,
  ease: motionEase.emphasized,
  y: 34,
} as const;

export const subtleParallax = {
  ease: "none",
  yPercent: -4,
} as const;
