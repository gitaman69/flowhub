#!/usr/bin/env node
// Fetches real npm download stats for every non-private @flowhub/* package
// and writes a dated markdown report plus a stable DOWNLOADS.md snapshot.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES_DIR = path.join(ROOT, "packages");
const REPORTS_DIR = path.join(ROOT, "reports", "downloads");
const NPM_ORG_URL = "https://www.npmjs.com/org/flowhub";
const REPO_URL = "https://github.com/gitaman69/flowhub";

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function dateRange(endDaysAgo, lengthDays) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - endDaysAgo);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (lengthDays - 1));
  return { start: toISODate(start), end: toISODate(end) };
}

async function discoverPackages() {
  const entries = await readdir(PACKAGES_DIR, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(PACKAGES_DIR, entry.name, "package.json");
    try {
      const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
      if (pkg.private) continue;
      if (!pkg.name) continue;
      names.push(pkg.name);
    } catch {
      // no package.json / not a package dir — skip
    }
  }
  return names.sort();
}

async function fetchDownloads(pkgName, start, end) {
  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${encodeURIComponent(pkgName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.downloads === "number" ? data.downloads : 0;
  } catch {
    return 0;
  }
}

async function fetchLatestVersion(pkgName) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(pkgName)}/latest`;
  try {
    const res = await fetch(url);
    if (!res.ok) return "?";
    const data = await res.json();
    return data.version ?? "?";
  } catch {
    return "?";
  }
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function formatChange(current, previous) {
  if (previous === 0) return current > 0 ? "🆕 new" : "–";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct > 0 ? "▲" : pct < 0 ? "▼" : "▬";
  return `${sign} ${Math.abs(pct).toFixed(1)}%`;
}

function medal(rank) {
  return { 1: "🥇", 2: "🥈", 3: "🥉" }[rank] ?? `${rank}`;
}

async function main() {
  const packageNames = await discoverPackages();
  const thisWeek = dateRange(1, 7);
  const prevWeek = dateRange(8, 7);

  const rows = [];
  for (const name of packageNames) {
    const [current, previous, version] = await Promise.all([
      fetchDownloads(name, thisWeek.start, thisWeek.end),
      fetchDownloads(name, prevWeek.start, prevWeek.end),
      fetchLatestVersion(name),
    ]);
    rows.push({ name, version, current, previous });
  }

  rows.sort((a, b) => b.current - a.current);

  const totalCurrent = rows.reduce((sum, r) => sum + r.current, 0);
  const totalPrevious = rows.reduce((sum, r) => sum + r.previous, 0);

  const growing = rows.filter((r) => r.previous > 0 && r.current > r.previous);
  const fastestGrowing = growing.sort(
    (a, b) => (b.current - b.previous) / b.previous - (a.current - a.previous) / a.previous,
  )[0];

  const topPackage = rows[0];
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const lines = [];
  lines.push("# 📊 Flow Hub — Weekly Downloads Report");
  lines.push("");
  lines.push(`_Generated ${generatedAt} · Week of **${thisWeek.start}** to **${thisWeek.end}**, compared against **${prevWeek.start}** to **${prevWeek.end}**_`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total downloads (7d):** ${formatNumber(totalCurrent)} (${formatChange(totalCurrent, totalPrevious)} vs previous week)`);
  lines.push(`- **Packages tracked:** ${rows.length}`);
  if (topPackage) {
    lines.push(`- **🏆 Top package:** \`${topPackage.name}\` — ${formatNumber(topPackage.current)} downloads`);
  }
  if (fastestGrowing) {
    lines.push(`- **🚀 Fastest growing:** \`${fastestGrowing.name}\` — ${formatChange(fastestGrowing.current, fastestGrowing.previous)}`);
  }
  lines.push("");
  lines.push("## Package Breakdown");
  lines.push("");
  lines.push("| Rank | Package | Version | Downloads (7d) | Previous week | Change |");
  lines.push("|---|---|---|---|---|---|");
  rows.forEach((r, i) => {
    const pkgLink = `[\`${r.name}\`](https://www.npmjs.com/package/${r.name})`;
    lines.push(
      `| ${medal(i + 1)} | ${pkgLink} | ${r.version} | ${formatNumber(r.current)} | ${formatNumber(r.previous)} | ${formatChange(r.current, r.previous)} |`,
    );
  });
  lines.push("");
  lines.push("## Links");
  lines.push("");
  lines.push(`- npm org: ${NPM_ORG_URL}`);
  lines.push(`- Repository: ${REPO_URL}`);
  lines.push("- Report history: [reports/downloads](reports/downloads)");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("_Auto-generated daily at 9:00 AM IST by [`.github/workflows/downloads-report.yml`](.github/workflows/downloads-report.yml). Data from the [npm downloads API](https://github.com/npm/registry/blob/master/docs/download-counts.md) — real counts, not estimates._");
  lines.push("");

  const report = lines.join("\n");

  await mkdir(REPORTS_DIR, { recursive: true });
  const datedPath = path.join(REPORTS_DIR, `${thisWeek.end}.md`);
  await writeFile(datedPath, report);
  await writeFile(path.join(ROOT, "DOWNLOADS.md"), report);

  console.log(`Wrote ${datedPath}`);
  console.log(`Wrote ${path.join(ROOT, "DOWNLOADS.md")}`);
  console.log(`Total downloads (7d): ${formatNumber(totalCurrent)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
