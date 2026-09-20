import Image from "next/image";

import { StaggerReveal } from "@/components/motion/stagger-reveal";

const steps = [
  {
    image: "/professionals/join-verify.webp",
    slug: "join",
    title: "Join & Verify",
    description: "Create your professional account and complete verification.",
  },
  {
    image: "/professionals/list-property.webp",
    slug: "list",
    title: "List Your Property",
    description: "Add property details, media, and supporting information for review.",
  },
  {
    image: "/professionals/manage-leads.webp",
    slug: "leads",
    title: "Manage Leads & Requests",
    description: "Track enquiries, applications, viewings, and conversations from one workspace.",
  },
  {
    image: "/professionals/close-grow.webp",
    slug: "grow",
    title: "Close & Grow",
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
          <article
            className="process-step-visual relative flex flex-col items-center text-center"
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
            <h3 className="process-step-title mt-4 text-lg font-semibold text-reality-text-primary md:mt-5 md:text-2xl">
              {step.title}
            </h3>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-reality-text-secondary md:text-base md:leading-7">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </StaggerReveal>
  );
}
