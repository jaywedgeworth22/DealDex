import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const STANDING_GROUP_NAME = "Standing testers";

export function testersJsonPath(fleetDir = dirname(fileURLToPath(import.meta.url))) {
  return join(fleetDir, "testers.json");
}

export function normalizeTesterEmails(raw) {
  const collected = [];
  if (Array.isArray(raw?.emails)) {
    for (const email of raw.emails) collected.push(email);
  } else if (Array.isArray(raw?.testers)) {
    for (const row of raw.testers) {
      collected.push(typeof row === "string" ? row : row?.email);
    }
  } else if (Array.isArray(raw)) {
    for (const row of raw) {
      collected.push(typeof row === "string" ? row : row?.email);
    }
  }

  const emails = [];
  const seen = new Set();
  for (const value of collected) {
    const email = String(value || "").trim().toLowerCase();
    if (!email.includes("@")) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

export function loadTestersJson(path = testersJsonPath()) {
  return normalizeTesterEmails(JSON.parse(readFileSync(path, "utf8")));
}

export function namesFromEmail(email) {
  const local = String(email).split("@")[0] || "tester";
  const bits = local.split(/[._+-]+/).filter(Boolean);
  const first = bits[0] || "tester";
  const last = bits.slice(1).join(" ") || "invite";
  return {
    firstName: first.charAt(0).toUpperCase() + first.slice(1),
    lastName: last.charAt(0).toUpperCase() + last.slice(1),
  };
}

export function isAlreadyPresent(status, parsed) {
  if (status === 409) return true;
  const errors = parsed?.errors || [];
  return errors.some((err) => {
    const code = String(err.code || "");
    const statusText = String(err.status || "");
    return (
      statusText === "409" ||
      /CONFLICT|DUPLICATE|ALREADY_EXISTS|RELATIONSHIP\.INVALID/i.test(code)
    );
  });
}

export async function inviteStandingTesters({ api, bundleId, emails, groupName = STANDING_GROUP_NAME }) {
  const apps = await api("GET", `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=1`);
  if (!apps.ok || !apps.parsed.data?.[0]) {
    throw new Error(`invite-testers: app not found for ${bundleId} (HTTP ${apps.status})`);
  }
  const appId = apps.parsed.data[0].id;
  const groupId = await ensureStandingGroup(api, appId, groupName);
  const results = [];

  for (const email of emails) {
    try {
      results.push(await inviteOneTester({ api, appId, email, groupId }));
    } catch (err) {
      results.push({
        email,
        ok: false,
        action: "failed",
        error: err && err.message ? err.message : String(err),
      });
    }
  }

  return {
    ok: results.every((row) => row.ok),
    appId,
    groupId,
    results,
  };
}

async function ensureStandingGroup(api, appId, groupName) {
  const list = await api("GET", `/v1/apps/${appId}/betaGroups?limit=50`);
  if (list.ok) {
    const groups = list.parsed.data || [];
    const wanted = groupName.toLowerCase();
    const named = groups.find((group) => String(group.attributes?.name || "").toLowerCase() === wanted);
    if (named) return named.id;
    const external = groups.find((group) => group.attributes?.isInternalGroup === false);
    if (external) return external.id;
  }

  const created = await api(
    "POST",
    "/v1/betaGroups",
    JSON.stringify({
      data: {
        type: "betaGroups",
        attributes: {
          name: groupName,
          hasAccessToAllBuilds: true,
        },
        relationships: {
          app: { data: { type: "apps", id: appId } },
        },
      },
    }),
  );
  if (created.ok && created.parsed.data?.id) return created.parsed.data.id;
  if (isAlreadyPresent(created.status, created.parsed) && list.ok) {
    const groups = list.parsed.data || [];
    return groups[0]?.id || null;
  }
  return null;
}

async function inviteOneTester({ api, appId, email, groupId }) {
  const assigned = await api(
    "GET",
    `/v1/betaTesters?filter[email]=${encodeURIComponent(email)}&filter[apps]=${encodeURIComponent(appId)}&limit=1`,
  );
  if (assigned.ok && assigned.parsed.data?.[0]) {
    return { email, ok: true, action: "already-assigned", testerId: assigned.parsed.data[0].id };
  }

  const existing = await api(
    "GET",
    `/v1/betaTesters?filter[email]=${encodeURIComponent(email)}&limit=5`,
  );
  if (!existing.ok) {
    throw new Error(`lookup failed HTTP ${existing.status}`);
  }
  let testerId = existing.parsed.data?.[0]?.id || null;

  if (!testerId) {
    const names = namesFromEmail(email);
    const created = await api(
      "POST",
      "/v1/betaTesters",
      JSON.stringify({
        data: {
          type: "betaTesters",
          attributes: {
            email,
            firstName: names.firstName,
            lastName: names.lastName,
          },
        },
      }),
    );
    if (created.ok && created.parsed.data?.id) {
      testerId = created.parsed.data.id;
    } else if (isAlreadyPresent(created.status, created.parsed)) {
      const again = await api(
        "GET",
        `/v1/betaTesters?filter[email]=${encodeURIComponent(email)}&limit=1`,
      );
      testerId = again.parsed.data?.[0]?.id || null;
    } else {
      throw new Error(`create failed HTTP ${created.status}`);
    }
  }

  if (!testerId) throw new Error("tester id missing after create/lookup");

  const invitation = await api(
    "POST",
    "/v1/betaTesterInvitations",
    JSON.stringify({
      data: {
        type: "betaTesterInvitations",
        relationships: {
          app: { data: { type: "apps", id: appId } },
          betaTester: { data: { type: "betaTesters", id: testerId } },
        },
      },
    }),
  );
  if (!invitation.ok && !isAlreadyPresent(invitation.status, invitation.parsed)) {
    throw new Error(`invite failed HTTP ${invitation.status}`);
  }

  if (groupId) {
    const add = await api(
      "POST",
      `/v1/betaGroups/${groupId}/relationships/betaTesters`,
      JSON.stringify({
        data: [{ type: "betaTesters", id: testerId }],
      }),
    );
    if (!add.ok && !isAlreadyPresent(add.status, add.parsed)) {
      throw new Error(`group add failed HTTP ${add.status}`);
    }
  }

  return {
    email,
    ok: true,
    action: invitation.ok ? "invited" : "already-invited",
    testerId,
  };
}
