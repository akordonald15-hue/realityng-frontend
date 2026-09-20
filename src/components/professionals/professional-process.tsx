import { StaggerReveal } from "@/components/motion/stagger-reveal";

type ProcessStep = {
  Art: () => React.ReactElement;
  description: string;
  slug: string;
  title: string;
};

const steps: ProcessStep[] = [
  {
    Art: JoinVerifyArt,
    slug: "join",
    title: "Join & Verify",
    description: "Create your professional account and complete verification.",
  },
  {
    Art: ListPropertyArt,
    slug: "list",
    title: "List Your Property",
    description: "Add property details, media, and supporting information for review.",
  },
  {
    Art: ManageLeadsArt,
    slug: "leads",
    title: "Manage Leads & Requests",
    description: "Track enquiries, applications, viewings, and conversations from one workspace.",
  },
  {
    Art: CloseGrowArt,
    slug: "grow",
    title: "Close & Grow",
    description: "Move qualified opportunities forward and manage more properties over time.",
  },
];

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
      <ProcessArtDefs />

      <div className="mx-auto max-w-[760px] text-center">
        <div data-motion-child>
          <h2 className="font-display text-4xl font-bold leading-tight text-reality-text-primary md:text-6xl">
            How it works
          </h2>
        </div>
        <p
          className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-reality-text-secondary md:text-lg md:leading-8"
          data-motion-child
        >
          List, manage, and grow in one workspace. Run listings, enquiries, and viewings from a
          single place.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:gap-x-8 md:gap-y-14 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Art = step.Art;
          return (
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
                <Art />
              </span>
              <h3 className="process-step-title mt-4 text-lg font-semibold text-reality-text-primary md:mt-5 md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-reality-text-secondary md:text-base md:leading-7">
                {step.description}
              </p>
            </article>
          );
        })}
      </div>
    </StaggerReveal>
  );
}

/**
 * Shared gradients for the process artwork. Kept in one hidden SVG so the four
 * pieces read as a single rendered set rather than four separately tinted
 * drawings. Sized 0x0 rather than display:none, which breaks gradient refs.
 */
function ProcessArtDefs() {
  return (
    <svg
      aria-hidden="true"
      className="absolute h-0 w-0 overflow-hidden"
      focusable="false"
      viewBox="0 0 0 0"
    >
      <defs>
        <radialGradient cx="34%" cy="22%" id="rngGlass" r="86%">
          <stop offset="0%" stopColor="#5FF0C0" />
          <stop offset="38%" stopColor="#1BA87B" />
          <stop offset="78%" stopColor="#0B5F46" />
          <stop offset="100%" stopColor="#04281E" />
        </radialGradient>
        <radialGradient cx="40%" cy="20%" id="rngGlassDeep" r="90%">
          <stop offset="0%" stopColor="#12916A" />
          <stop offset="60%" stopColor="#074734" />
          <stop offset="100%" stopColor="#032018" />
        </radialGradient>
        <radialGradient cx="30%" cy="18%" id="rngPane" r="92%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="52%" stopColor="#ECF4EF" />
          <stop offset="100%" stopColor="#BFD2C8" />
        </radialGradient>
        <linearGradient id="rngChrome" x1="12%" x2="88%" y1="4%" y2="96%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="26%" stopColor="#D5E0DA" />
          <stop offset="48%" stopColor="#8B9C94" />
          <stop offset="68%" stopColor="#F2F7F4" />
          <stop offset="100%" stopColor="#6D7C75" />
        </linearGradient>
        <linearGradient id="rngChromeEdge" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7E8D86" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient cx="50%" cy="50%" id="rngSpec" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient cx="50%" cy="50%" id="rngGlow" r="50%">
          <stop offset="0%" stopColor="#2FD39A" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#2FD39A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function ArtFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="process-step-art-object h-full w-full"
      focusable="false"
      viewBox="0 0 256 256"
    >
      <ellipse cx="128" cy="150" fill="url(#rngGlow)" rx="116" ry="102" />
      {children}
    </svg>
  );
}

/** Chrome seal ring with a glass core - the motif shared across all four pieces. */
function Seal({
  children,
  cx,
  cy,
  r,
}: {
  children: React.ReactNode;
  cx: number;
  cy: number;
  r: number;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} fill="url(#rngChrome)" r={r} />
      <circle
        cx={cx}
        cy={cy}
        fill="none"
        r={r - 2}
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="1.6"
      />
      <circle cx={cx} cy={cy} fill="url(#rngGlassDeep)" r={r - 8} />
      <circle cx={cx} cy={cy} fill="url(#rngGlass)" r={r - 11} />
      <ellipse
        cx={cx - r * 0.24}
        cy={cy - r * 0.34}
        fill="url(#rngSpec)"
        rx={r * 0.46}
        ry={r * 0.3}
        transform={`rotate(-28 ${cx - r * 0.24} ${cy - r * 0.34})`}
      />
      {children}
    </g>
  );
}

function JoinVerifyArt() {
  return (
    <ArtFrame>
      <defs>
        <clipPath id="rngShieldClip">
          <path d="M118 34 40 64v66c0 44 34 74 78 90 44-16 78-46 78-90V64Z" />
        </clipPath>
      </defs>

      <path
        d="M126 42 52 70v64c0 42 32 71 74 86 42-15 74-44 74-86V70Z"
        fill="url(#rngGlassDeep)"
        opacity="0.85"
      />
      <path d="M118 34 40 64v66c0 44 34 74 78 90 44-16 78-46 78-90V64Z" fill="url(#rngGlass)" />
      <g clipPath="url(#rngShieldClip)">
        <ellipse cx="72" cy="66" fill="url(#rngSpec)" rx="60" ry="44" transform="rotate(-34 72 66)" />
        <path d="M118 34 40 64v34l78-30Z" fill="#FFFFFF" opacity="0.16" />
      </g>
      <path
        d="M118 34 40 64v66c0 44 34 74 78 90 44-16 78-46 78-90V64Z"
        fill="none"
        stroke="url(#rngChromeEdge)"
        strokeWidth="3.5"
      />

      <circle cx="118" cy="104" fill="#FFFFFF" fillOpacity="0.9" r="21" />
      <path
        d="M84 158c5-19 17-29 34-29s29 10 34 29a78 78 0 0 1-68 0Z"
        fill="#FFFFFF"
        fillOpacity="0.82"
      />

      <Seal cx={196} cy={188} r={44}>
        <path
          d="m178 189 12 13 25-28"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="10"
        />
      </Seal>
    </ArtFrame>
  );
}

function ListPropertyArt() {
  return (
    <ArtFrame>
      <defs>
        <clipPath id="rngHouseClip">
          <path d="M64 224V118l64-50 64 50v106Z" />
        </clipPath>
      </defs>

      <path d="M72 230V126l64-50 64 50v104Z" fill="url(#rngGlassDeep)" opacity="0.8" />
      <path d="M64 224V118l64-50 64 50v106Z" fill="url(#rngGlass)" />
      <g clipPath="url(#rngHouseClip)">
        <ellipse cx="92" cy="130" fill="url(#rngSpec)" rx="52" ry="60" transform="rotate(-26 92 130)" />
      </g>
      <path d="M40 126 128 56l88 70-13 16-75-60-75 60Z" fill="url(#rngChrome)" />
      <path
        d="M40 126 128 56l88 70-13 16-75-60-75 60Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.5"
        strokeWidth="1.6"
      />
      <rect fill="#FFFFFF" fillOpacity="0.32" height="34" rx="6" width="34" x="111" y="132" />
      <path
        d="M64 224V118l64-50 64 50v106Z"
        fill="none"
        stroke="url(#rngChromeEdge)"
        strokeWidth="3.5"
      />

      <g transform="rotate(-9 74 190)">
        <rect fill="url(#rngGlassDeep)" height="84" opacity="0.5" rx="10" width="72" x="34" y="152" />
        <rect fill="url(#rngPane)" height="84" rx="10" width="72" x="30" y="148" />
        <rect
          fill="none"
          height="84"
          rx="10"
          stroke="#FFFFFF"
          strokeOpacity="0.9"
          strokeWidth="2"
          width="72"
          x="30"
          y="148"
        />
        <rect fill="#0B5F46" fillOpacity="0.5" height="7" rx="3.5" width="44" x="42" y="164" />
        <rect fill="#0B5F46" fillOpacity="0.32" height="7" rx="3.5" width="50" x="42" y="182" />
        <rect fill="#0B5F46" fillOpacity="0.32" height="7" rx="3.5" width="32" x="42" y="200" />
      </g>

      <Seal cx={198} cy={62} r={38}>
        <path
          d="M198 45v34M181 62h34"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeWidth="10"
        />
      </Seal>
    </ArtFrame>
  );
}

function ManageLeadsArt() {
  return (
    <ArtFrame>
      <g transform="rotate(-8 128 140)">
        <rect fill="url(#rngGlassDeep)" height="104" opacity="0.42" rx="16" width="150" x="46" y="70" />
        <rect fill="url(#rngPane)" height="104" rx="16" width="150" x="42" y="66" />
        <rect
          fill="none"
          height="104"
          rx="16"
          stroke="#FFFFFF"
          strokeOpacity="0.85"
          strokeWidth="2"
          width="150"
          x="42"
          y="66"
        />
      </g>

      <rect fill="url(#rngGlassDeep)" height="112" opacity="0.5" rx="18" width="158" x="54" y="112" />
      <rect fill="url(#rngPane)" height="112" rx="18" width="158" x="48" y="106" />
      <rect
        fill="none"
        height="112"
        rx="18"
        stroke="#FFFFFF"
        strokeOpacity="0.95"
        strokeWidth="2.4"
        width="158"
        x="48"
        y="106"
      />
      <ellipse cx="92" cy="128" fill="url(#rngSpec)" rx="54" ry="26" transform="rotate(-14 92 128)" />

      <circle cx="80" cy="140" fill="url(#rngGlass)" r="15" />
      <circle cx="80" cy="140" fill="none" r="15" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.6" />
      <rect fill="#0B5F46" fillOpacity="0.52" height="8" rx="4" width="76" x="106" y="130" />
      <rect fill="#0B5F46" fillOpacity="0.26" height="8" rx="4" width="50" x="106" y="146" />

      <circle cx="80" cy="190" fill="url(#rngGlass)" opacity="0.72" r="15" />
      <circle cx="80" cy="190" fill="none" r="15" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.6" />
      <rect fill="#0B5F46" fillOpacity="0.4" height="8" rx="4" width="64" x="106" y="180" />
      <rect fill="#0B5F46" fillOpacity="0.22" height="8" rx="4" width="38" x="106" y="196" />

      <Seal cx={192} cy={70} r={42}>
        <path
          d="M177 52h30a8 8 0 0 1 8 8v17a8 8 0 0 1-8 8h-12l-12 10V85h-6a8 8 0 0 1-8-8V60a8 8 0 0 1 8-8Z"
          fill="#FFFFFF"
        />
      </Seal>
      <circle cx="220" cy="42" fill="#FFFFFF" r="13" />
      <circle cx="220" cy="42" fill="url(#rngGlass)" r="9" />
    </ArtFrame>
  );
}

function CloseGrowArt() {
  /** Rising columns read as progression at 96px where a thin trend line did not. */
  const columns = [
    { height: 62, x: 30 },
    { height: 96, x: 82 },
    { height: 136, x: 134 },
  ];
  const baseline = 208;

  return (
    <ArtFrame>
      {columns.map((column) => (
        <g key={column.x}>
          <rect
            fill="url(#rngGlassDeep)"
            height={column.height}
            opacity="0.55"
            rx="12"
            width="40"
            x={column.x + 6}
            y={baseline - column.height + 6}
          />
          <rect
            fill="url(#rngGlass)"
            height={column.height}
            rx="12"
            width="40"
            x={column.x}
            y={baseline - column.height}
          />
          <rect
            fill="url(#rngSpec)"
            height={column.height * 0.42}
            rx="8"
            width="14"
            x={column.x + 7}
            y={baseline - column.height + 9}
          />
          <rect
            fill="none"
            height={column.height}
            rx="12"
            stroke="url(#rngChromeEdge)"
            strokeWidth="2.4"
            width="40"
            x={column.x}
            y={baseline - column.height}
          />
        </g>
      ))}

      <rect fill="url(#rngChrome)" height="11" rx="5.5" width="186" x="22" y={baseline} />
      <rect
        fill="none"
        height="11"
        rx="5.5"
        stroke="#FFFFFF"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        width="186"
        x="22"
        y={baseline}
      />

      <Seal cx={192} cy={182} r={46}>
        <path
          d="m173 183 13 14 26-29"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="11"
        />
      </Seal>
    </ArtFrame>
  );
}
