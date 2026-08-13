# DealDex — source of truth

**GitHub `main` is the product.** The live site deploys from it. Every agent
(Grok, Claude, Cursor, Copilot) and every human works against the same repo.

Repo: https://github.com/jaywedgeworth22/DealDex

## For any agent (do this every session)

1. **Pull first.** Never start from a stale checkout.
   ```bash
   git fetch origin
   git checkout main
   git pull --rebase origin main
   ```
2. Make the change. Keep the preview running if you have one.
3. **Commit and push to `main`.** That is what ships.
   ```bash
   git add -A
   git status
   git commit -m "Short, user-facing description"
   git push origin main
   ```
4. If push is rejected, pull --rebase and push again. Do not force-push `main`.

Do not keep a long-lived fork of the product in a sandbox. If this workspace
drifts from GitHub, GitHub wins — pull, then re-apply only the work that is
still missing.

## Live site

Vercel builds `main` on every push.

**One-time (Jay):** open
[Import DealDex on Vercel](https://vercel.com/new/import?s=https://github.com/jaywedgeworth22/DealDex)
while signed into the same GitHub account, import the private repo, and leave
the production branch as `main`. After that, agents only need to push.

If the project is already imported, you are done. Later agents should not create
a second Vercel project.

## What not to commit

Secrets stay in Vercel env / device Settings, never in git. See `.gitignore`.
`.env` files are ignored on purpose.

## Local / preview

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run typecheck
npm run build
```
