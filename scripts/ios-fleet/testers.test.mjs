import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  inviteStandingTesters,
  isAlreadyPresent,
  loadTestersJson,
  namesFromEmail,
  normalizeTesterEmails,
  testersJsonPath,
} from "./testers.mjs";

const FLEET = dirname(fileURLToPath(import.meta.url));

test("testers.json lists only the two standing DealDex emails", () => {
  const raw = JSON.parse(readFileSync(join(FLEET, "testers.json"), "utf8"));
  assert.deepEqual(raw.emails, [
    "johnwedeworth@comcast.net",
    "mail@jays.services",
  ]);
  assert.equal(loadTestersJson(testersJsonPath(FLEET)).length, 2);
});

test("normalizeTesterEmails dedupes and drops junk", () => {
  assert.deepEqual(
    normalizeTesterEmails({
      emails: [
        "Mail@Jays.services",
        "johnwedeworth@comcast.net",
        "mail@jays.services",
        "not-an-email",
        "",
      ],
    }),
    ["mail@jays.services", "johnwedeworth@comcast.net"],
  );
});

test("namesFromEmail is deterministic and does not invent a person", () => {
  const john = namesFromEmail("johnwedeworth@comcast.net");
  assert.equal(john.firstName, "Johnwedeworth");
  assert.equal(john.lastName, "Invite");
});

test("isAlreadyPresent treats 409 and conflict codes as idempotent success", () => {
  assert.equal(isAlreadyPresent(409, {}), true);
  assert.equal(isAlreadyPresent(409, { errors: [{ code: "ENTITY_ERROR.CONFLICT" }] }), true);
  assert.equal(
    isAlreadyPresent(422, { errors: [{ code: "ENTITY_ERROR.RELATIONSHIP.INVALID" }] }),
    true,
  );
  assert.equal(isAlreadyPresent(500, { errors: [{ code: "UNEXPECTED" }] }), false);
});

test("inviteStandingTesters skips emails already on the app", async () => {
  const calls = [];
  const api = async (method, path, body) => {
    calls.push({ method, path, body });
    if (path.startsWith("/v1/apps?") && method === "GET") {
      return { ok: true, status: 200, parsed: { data: [{ id: "app-1" }] } };
    }
    if (path.startsWith("/v1/apps/app-1/betaGroups")) {
      return {
        ok: true,
        status: 200,
        parsed: { data: [{ id: "group-1", attributes: { name: "Standing testers" } }] },
      };
    }
    if (path.includes("filter[apps]=")) {
      return { ok: true, status: 200, parsed: { data: [{ id: "tester-1" }] } };
    }
    throw new Error(`unexpected ${method} ${path}`);
  };

  const summary = await inviteStandingTesters({
    api,
    bundleId: "net.dealdex",
    emails: ["johnwedeworth@comcast.net"],
  });
  assert.equal(summary.ok, true);
  assert.equal(summary.results[0].action, "already-assigned");
  assert.equal(calls.some((c) => c.method === "POST"), false);
});

test("inviteStandingTesters creates, invites, and treats 409 as already invited", async () => {
  const api = async (method, path) => {
    if (path.startsWith("/v1/apps?") && method === "GET") {
      return { ok: true, status: 200, parsed: { data: [{ id: "app-1" }] } };
    }
    if (path.startsWith("/v1/apps/app-1/betaGroups")) {
      return { ok: true, status: 200, parsed: { data: [] } };
    }
    if (method === "POST" && path === "/v1/betaGroups") {
      return { ok: true, status: 201, parsed: { data: { id: "group-1" } } };
    }
    if (path.includes("filter[apps]=")) {
      return { ok: true, status: 200, parsed: { data: [] } };
    }
    if (path.startsWith("/v1/betaTesters?filter[email]=") && !path.includes("filter[apps]=")) {
      return { ok: true, status: 200, parsed: { data: [] } };
    }
    if (method === "POST" && path === "/v1/betaTesters") {
      return { ok: true, status: 201, parsed: { data: { id: "tester-new" } } };
    }
    if (method === "POST" && path === "/v1/betaTesterInvitations") {
      return { ok: false, status: 409, parsed: { errors: [{ status: "409" }] } };
    }
    if (method === "POST" && path.includes("/relationships/betaTesters")) {
      return { ok: true, status: 204, parsed: {} };
    }
    throw new Error(`unexpected ${method} ${path}`);
  };

  const summary = await inviteStandingTesters({
    api,
    bundleId: "net.dealdex",
    emails: ["mail@jays.services"],
  });
  assert.equal(summary.ok, true);
  assert.equal(summary.results[0].action, "already-invited");
  assert.equal(summary.results[0].testerId, "tester-new");
});

test("inviteStandingTesters keeps going when one email fails", async () => {
  const api = async (method, path) => {
    if (path.startsWith("/v1/apps?") && method === "GET") {
      return { ok: true, status: 200, parsed: { data: [{ id: "app-1" }] } };
    }
    if (path.startsWith("/v1/apps/app-1/betaGroups")) {
      return {
        ok: true,
        status: 200,
        parsed: { data: [{ id: "group-1", attributes: { name: "Standing testers" } }] },
      };
    }
    if (path.includes("johnwedeworth") && path.includes("filter[apps]=")) {
      return { ok: false, status: 500, parsed: {} };
    }
    if (path.includes("johnwedeworth")) {
      return { ok: false, status: 500, parsed: {} };
    }
    if (path.includes("filter[apps]=")) {
      return { ok: true, status: 200, parsed: { data: [{ id: "tester-2" }] } };
    }
    throw new Error(`unexpected ${method} ${path}`);
  };

  const summary = await inviteStandingTesters({
    api,
    bundleId: "net.dealdex",
    emails: ["johnwedeworth@comcast.net", "mail@jays.services"],
  });
  assert.equal(summary.ok, false);
  assert.equal(summary.results[0].ok, false);
  assert.equal(summary.results[1].ok, true);
  assert.equal(summary.results[1].action, "already-assigned");
});
