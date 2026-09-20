import { StaggerReveal } from "@/components/motion/stagger-reveal";

type ProcessStep = {
  Icon: (props: { className?: string }) => React.ReactElement;
  description: string;
  title: string;
};

const steps: ProcessStep[] = [
  {
    Icon: JoinVerifyIcon,
    title: "Join & Verify",
    description: "Create your professional account and complete verification.",
  },
  {
    Icon: ListPropertyIcon,
    title: "List Your Property",
    description: "Add property details, media, and supporting information for review.",
  },
  {
    Icon: ManageLeadsIcon,
    title: "Manage Leads & Requests",
    description: "Track enquiries, applications, viewings, and conversations from one workspace.",
  },
  {
    Icon: CloseGrowIcon,
    title: "Close & Grow",
    description: "Move qualified opportunities forward and manage more properties over time.",
  },
];

export function ProfessionalProcess() {
  return (
    <StaggerReveal
      as="section"
      className="rounded-[2rem] bg-reality-surfaceBrand px-5 py-12 md:px-10 md:py-16"
      duration={0.76}
      stagger={0.1}
      start="top 86%"
      visibleEntrance
      y={40}
    >
      <div className="mx-auto max-w-[620px] text-center">
        <div data-motion-child>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-text-brand">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-reality-text-primary md:text-5xl">
            List, manage, and grow in one workspace
          </h2>
        </div>
        <p
          className="mx-auto mt-4 max-w-[480px] text-sm leading-6 text-reality-text-secondary md:text-base md:leading-7"
          data-motion-child
        >
          Set up your professional account once, then run listings, enquiries, and viewings from a
          single place.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:gap-5 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.Icon;
          return (
            <article
              className="process-step-card flex flex-col items-center rounded-[20px] bg-reality-surface p-4 text-center shadow-reality-sm md:p-6"
              data-motion-child
              key={step.title}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-reality-brand-600 md:text-[11px]">
                Step {index + 1}
              </p>
              <span
                className="process-step-float mt-3 grid h-16 w-16 place-items-center rounded-full bg-reality-surfaceBrand md:mt-4 md:h-[72px] md:w-[72px]"
                style={{ animationDelay: `${index * -0.8}s` }}
              >
                <Icon className="process-step-icon h-8 w-8 text-reality-brandEmphasis md:h-9 md:w-9" />
              </span>
              <h3 className="process-step-title mt-4 text-base font-semibold text-reality-text-primary md:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-reality-text-tertiary md:text-sm md:leading-6">
                {step.description}
              </p>
            </article>
          );
        })}
      </div>
    </StaggerReveal>
  );
}

const drawStyle = (length: number) => ({ "--process-draw": String(length) }) as React.CSSProperties;

function JoinVerifyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        <path d="M12 21.2s7-3.4 7-9.6V5.6L12 3 5 5.6v6c0 6.2 7 9.6 7 9.6Z" />
        <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M8.9 16c.7-1.3 1.8-2 3.1-2s2.4.7 3.1 2" />
        <circle
          className="process-step-pop process-step-knockout"
          cx="18.3"
          cy="18.3"
          r="4.2"
        />
        <path
          className="process-step-draw process-step-delay-1"
          d="m16.3 18.4 1.4 1.4 2.6-3"
          style={drawStyle(6.9)}
        />
      </g>
    </svg>
  );
}

function ListPropertyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        <path d="M5.4 20.6V9.6L12 5.1l6.6 4.5v11" />
        <path d="M3.4 20.6h17.2" />
        <path d="M9 11.9h.01M15 11.9h.01" />
        <path className="process-step-draw" d="M8.6 15.4h6.8" style={drawStyle(7.4)} />
        <path
          className="process-step-draw process-step-delay-1"
          d="M8.6 18h4.2"
          style={drawStyle(4.8)}
        />
        <g className="process-step-pop process-step-delay-2">
          <circle className="process-step-knockout" cx="18.6" cy="5.6" r="4.2" />
          <path d="M18.6 3.7v3.8M16.7 5.6h3.8" />
        </g>
      </g>
    </svg>
  );
}

function ManageLeadsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        <path d="M4.2 4.6h15.6a1.6 1.6 0 0 1 1.6 1.6v11.6a1.6 1.6 0 0 1-1.6 1.6H4.2a1.6 1.6 0 0 1-1.6-1.6V6.2a1.6 1.6 0 0 1 1.6-1.6Z" />
        <circle cx="7.4" cy="9.6" r="1.6" />
        <circle cx="7.4" cy="14.6" r="1.6" />
        <path className="process-step-draw" d="M11.2 9.6h6.6" style={drawStyle(7.2)} />
        <path
          className="process-step-draw process-step-delay-1"
          d="M11.2 14.6h4.2"
          style={drawStyle(4.8)}
        />
        <circle
          className="process-step-pop process-step-knockout process-step-delay-2"
          cx="19.6"
          cy="5"
          r="2.9"
        />
        <circle className="process-step-pulse" cx="19.6" cy="5" r="4.6" />
      </g>
    </svg>
  );
}

function CloseGrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        <path d="M6.5 2.9h7.3l5 5v10.8a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.7V4.4a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M13.8 2.9v5h5" />
        <path
          className="process-step-draw"
          d="m8.2 12.4 2.3 2.3 4.4-4.8"
          style={drawStyle(10.4)}
        />
        <g className="process-step-pop process-step-delay-2">
          <circle className="process-step-knockout" cx="18.6" cy="18.4" r="4.4" />
          <path d="M18.6 20.4v-3.9M16.8 18.3l1.8-1.8 1.8 1.8" />
        </g>
      </g>
    </svg>
  );
}
