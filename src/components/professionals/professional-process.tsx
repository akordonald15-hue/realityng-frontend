"use client";

import Image from "next/image";

import { StepExplanation } from "@/components/how-it-works/step-explanation";
import { StaggerReveal } from "@/components/motion/stagger-reveal";

const steps = [
  {
    image: "/professionals/join-verify.webp",
    slug: "join",
    title: "Join & Verify",
    guide: { explanation: "Create a free account and request the artisan role during professional setup. Artisan-role approval and professional verification are separate reviews; signing up does not automatically approve or verify you. Submit your professional details through Verification after setup.", action: "Create artisan account", href: "/auth/sign-up?role=artisan&next=%2Fonboarding%2Frole-setup", artisanSignup: true },
    description: "Create your professional account and complete verification.",
  },
  {
    image: "/professionals/list-property.webp",
    slug: "list",
    title: "List Your Property",
    guide: { explanation: "Approved property owners and agents can save a draft, add details and media, then submit it for admin review. A listing becomes public only after approval. An artisan role alone does not currently provide property listing access.", action: "Browse properties", href: "/properties" },
    description: "Add property details, media, and supporting information for review.",
  },
  {
    image: "/professionals/manage-leads.webp",
    slug: "leads",
    title: "Manage Leads & Requests",
    guide: { explanation: "Sign in to your dashboard to follow the enquiries, viewings, applications and conversations you are authorized to access. Property management tools require an approved owner or agent role, or the relevant assignment.", action: "Open my dashboard", href: "/dashboard", protected: true },
    description: "Track enquiries, applications, viewings, and conversations from one workspace.",
  },
  {
    image: "/professionals/close-grow.webp",
    slug: "grow",
    title: "Close & Grow",
    guide: { explanation: "Use your dashboard to follow existing applications and transaction records, and keep your professional profile up to date. Access depends on your approved roles and involvement; this step does not automatically complete a transaction or move funds.", action: "Open my dashboard", href: "/dashboard", protected: true },
    description: "Move qualified opportunities forward and manage more properties over time.",
  },
] as const;

export function ProfessionalProcess() {
  return (
    <StaggerReveal
      as="section"
      className="rounded-[2rem] bg-reality-surface px-5 py-14 md:px-10 md:py-20"
      duration={0.76}
      stagger={0.1}
      start="top 86%"
      visibleEntrance
      y={40}
    >
      <div className="mx-auto max-w-[760px] text-center">
        <h2
          className="font-display text-4xl font-bold leading-tight text-reality-text-primary md:text-6xl"
          data-motion-child
        >
          How it works
        </h2>
        <p
          className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-reality-text-secondary md:text-lg md:leading-8"
          data-motion-child
        >
          List, manage, and grow in one workspace. Run listings, enquiries, and viewings from a
          single place.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:gap-x-8 md:gap-y-14 xl:grid-cols-4">
        {steps.map((step, index) => (
          <StepExplanation
            title={step.title}
            guide={step.guide}
            className="process-step-visual relative flex flex-col items-center text-center rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
            data-motion-child
            data-step={step.slug}
            key={step.title}
          >
            <span
              className="process-step-art relative block h-36 w-36 md:h-48 md:w-48 xl:h-56 xl:w-56"
              style={{ animationDelay: `${index * -0.8}s` }}
            >
              <Image
                alt=""
                className="process-step-art-object h-full w-full object-contain"
                height={768}
                sizes="(min-width: 1280px) 224px, (min-width: 768px) 192px, 144px"
                src={step.image}
                width={768}
              />
            </span>
            <span className="process-step-title mt-4 min-h-[3.5rem] text-lg font-semibold text-reality-text-primary md:mt-5 md:min-h-[4rem] md:text-2xl lg:min-h-0 xl:min-h-[4rem]">
              {step.title}
            </span>
            <span className="mt-2 max-w-[280px] text-sm leading-6 text-reality-text-secondary md:text-base md:leading-7">
              {step.description}
            </span>
          </StepExplanation>
        ))}
      </div>
    </StaggerReveal>
  );
}
