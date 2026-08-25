# 2026-08-25 — testers.json Comcast typo

Seat: CURSOR.  Branch: `cursor/testers-comcast-typo-160f`.

`scripts/ios-fleet/testers.json` listed `johnwedeworth@comcast.net`.  The
local part is missing a `g`.  Correct address is
`johnwedgeworth@comcast.net`.  `mail@jays.services` is unchanged.

No extra testers.  Invite-on-ship comments/tests are not on `main`
(#178 left them off).  Did not expand invite logic, change ios-ship,
or pass `--force-ship`.

Remaining emails:

- `johnwedgeworth@comcast.net`
- `mail@jays.services`
