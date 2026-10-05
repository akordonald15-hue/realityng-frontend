import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export default function globalSetup() {
  const generated = path.resolve(process.cwd(), "e2e/.generated");
  mkdirSync(generated, { recursive: true });

  const suppliedSeed = process.env.REALITYNG_E2E_SEED_FILE;
  if (suppliedSeed) {
    const rawSeed = readFileSync(path.resolve(suppliedSeed), "utf8");
    const seed = JSON.parse(rawSeed) as { password?: string; users?: Record<string, string> };
    const emails = Object.values(seed.users ?? {});
    if (
      !seed.password ||
      seed.password.length < 16 ||
      emails.length === 0 ||
      emails.some((email) => !email.startsWith("sprint15.qa.") || !email.endsWith("@example.test"))
    ) {
      throw new Error("Remote E2E seed is not a valid RealityNG synthetic-only fixture.");
    }
    writeFileSync(path.join(generated, "seed.json"), JSON.stringify(seed));
    return;
  }

  if (process.env.REALITYNG_E2E_REMOTE === "true") {
    throw new Error(
      "REALITYNG_E2E_SEED_FILE is required for remote pre-beta E2E runs.",
    );
  }

  const backend = path.resolve(
    process.env.REALITYNG_E2E_BACKEND_CWD ?? path.join(process.cwd(), "../realityng-backend"),
  );
  const output = execFileSync(
    process.env.REALITYNG_E2E_BACKEND_PYTHON ?? path.join(backend, ".venv/Scripts/python.exe"),
    ["manage.py", "seed_sprint15_browser_qa", "--json"],
    {
      cwd: backend,
      encoding: "utf8",
      env: {
        ...process.env,
        DJANGO_SETTINGS_MODULE: "config.settings.local",
        SECRET_KEY: "local-development-secret",
        DATABASE_URL: "postgres://realityng:realityng@127.0.0.1:55432/realityng",
        REDIS_URL: "redis://127.0.0.1:56379/0",
        CELERY_BROKER_URL: "redis://127.0.0.1:56379/0",
        CELERY_RESULT_BACKEND: "redis://127.0.0.1:56379/0",
      },
    },
  ).trim();
  const seed = JSON.parse(output.slice(output.lastIndexOf("\n") + 1));
  writeFileSync(path.join(generated, "seed.json"), JSON.stringify(seed, null, 2));
}
