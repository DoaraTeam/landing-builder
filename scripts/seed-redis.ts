// One-off script: seeds Upstash Redis from the current local JSON files, so
// switching landing-config-store.ts over to Redis doesn't start empty.
// Run once per Redis instance (e.g. once for the dev DB, once before the
// first production deploy that includes this change) via:
//   npx tsx scripts/seed-redis.ts
import { readFile } from "fs/promises";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "public/data/landing-config.json");
const VERSIONS_PATH = join(process.cwd(), "public/data/landing-config.versions.json");
const CONFIG_KEY = "landing-config";
const VERSIONS_KEY = "landing-config-versions";

async function main() {
  // `tsx scripts/seed-redis.ts` doesn't auto-load .env.local the way
  // `next dev` does — load it explicitly, then dynamic-import the redis
  // client so it's constructed after the env vars are actually set.
  process.loadEnvFile(join(process.cwd(), ".env.local"));
  const { redis } = await import("../src/lib/redis");

  const configRaw = await readFile(CONFIG_PATH, "utf-8");
  const config = JSON.parse(configRaw);
  await redis.set(CONFIG_KEY, config);
  console.log(`Seeded "${CONFIG_KEY}" with ${Object.keys(config.pages).length} pages.`);

  try {
    const versionsRaw = await readFile(VERSIONS_PATH, "utf-8");
    const versions = JSON.parse(versionsRaw);
    await redis.set(VERSIONS_KEY, versions);
    console.log(`Seeded "${VERSIONS_KEY}" with ${Object.keys(versions).length} pages' history.`);
  } catch (error) {
    console.log(`No local versions file found at ${VERSIONS_PATH}, skipping.`, error);
  }
}

main();
