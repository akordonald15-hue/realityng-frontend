import Image from "next/image";

export default function Loading() {
  return (
    <div
      aria-label="RealityNG loading"
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,rgba(17,36,29,0.96),#081c15_62%,#020806_100%)] px-6 text-center"
      role="status"
    >
      <div className="flex flex-col items-center">
        <Image
          alt="RealityNG"
          className="h-auto w-[min(78vw,520px)] object-contain"
          height={800}
          priority
          src="/brand/realityng-logo-splash.png"
          width={1200}
        />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-brand-secondary sm:text-sm">
          Where Dreams Find an Address
        </p>
      </div>
    </div>
  );
}
