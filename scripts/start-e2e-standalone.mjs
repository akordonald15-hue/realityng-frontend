import { spawnSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import path from "node:path";

const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) process.exit(build.status ?? 1);

const standalone = path.resolve(".next/standalone");
if (existsSync("public")) cpSync("public", path.join(standalone, "public"), { recursive: true });
cpSync(".next/static", path.join(standalone, ".next/static"), { recursive: true });
if (process.argv.includes("--build-only")) process.exit(0);
const server = spawnSync(process.execPath, [path.join(standalone, "server.js")], {
  stdio: "inherit",
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: process.env.REALITYNG_E2E_FRONTEND_PORT ?? "3000" },
});
process.exit(server.status ?? 1);
