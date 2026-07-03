import fs from "node:fs";

const path = "docs/harness/FEATURE_LIST.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

const allowed = new Set(["not_started", "active", "blocked", "passing"]);
const active = [];

if (!data.project) {
  throw new Error("Feature list missing project");
}

if (!data.rules || data.rules.wip_limit !== 1) {
  throw new Error("Feature list must set rules.wip_limit to 1");
}

if (!Array.isArray(data.features)) {
  throw new Error("Feature list missing features array");
}

for (const feature of data.features) {
  if (!feature.id) throw new Error("Feature missing id");
  if (!feature.behavior) throw new Error(`${feature.id} missing behavior`);
  if (!feature.state) throw new Error(`${feature.id} missing state`);
  if (!allowed.has(feature.state)) throw new Error(`${feature.id} invalid state`);
  if (!feature.scope?.allowed_files?.length) {
    throw new Error(`${feature.id} missing allowed files`);
  }
  if (!feature.scope?.forbidden_files?.length) {
    throw new Error(`${feature.id} missing forbidden files`);
  }
  if (!feature.verification?.commands?.length) {
    throw new Error(`${feature.id} missing verification commands`);
  }
  if (!feature.verification?.manual_checks?.length) {
    throw new Error(`${feature.id} missing manual checks`);
  }
  if (feature.state === "active") active.push(feature.id);
  if (feature.state === "passing" && !feature.evidence?.length) {
    throw new Error(`${feature.id} is passing but has no evidence`);
  }
}

if (active.length > 1) {
  throw new Error(`WIP=1 violated. Active features: ${active.join(", ")}`);
}

console.log("FEATURE_LIST.json OK");
