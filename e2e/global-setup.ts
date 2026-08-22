import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export default function globalSetup() {
  const backend = path.resolve(process.cwd(), "../realityng-backend");
  const output = execFileSync(
    path.join(backend, ".venv/Scripts/python.exe"),
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
  const generated = path.resolve(process.cwd(), "e2e/.generated");
  mkdirSync(generated, { recursive: true });
  writeFileSync(path.join(generated, "seed.json"), JSON.stringify(seed, null, 2));
}
