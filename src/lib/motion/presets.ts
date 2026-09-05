export const motionEase = {
  standard: "power2.out",
  emphasized: "power3.out",
} as const;

export const motionDurations = {
  reveal: 0.72,
  hero: 0.78,
  imageSettle: 1.05,
  cardReveal: 0.52,
} as const;

export const fadeUp = {
  from: { autoAlpha: 0, y: 24 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.reveal,
    ease: motionEase.emphasized,
    y: 0,
  },
} as const;

export const heroReveal = {
  from: { autoAlpha: 0, y: 30 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.hero,
    ease: motionEase.emphasized,
    y: 0,
  },
} as const;

export const imageSettle = {
  from: { autoAlpha: 0.92, scale: 1.025 },
  to: {
    autoAlpha: 1,
    duration: motionDurations.imageSettle,
    ease: motionEase.standard,
    scale: 1,
  },
} as const;

export const staggerChildren = {
  amount: 0.08,
  duration: motionDurations.cardReveal,
  ease: motionEase.emphasized,
  y: 18,
} as const;

export const subtleParallax = {
  ease: "none",
  yPercent: -4,
} as const;
