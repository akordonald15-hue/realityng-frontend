import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7faf8]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700">
            RealityNG Sprint 0
          </p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">
            PropTech infrastructure for trusted Nigerian property journeys.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            The web foundation is ready for Sprint 1 authentication, roles, and user profiles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Explore foundation</Button>
            <Button variant="secondary">View API health</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
