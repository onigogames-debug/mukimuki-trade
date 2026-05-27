# Deployment Status

Last updated: 2026-05-27

## GitHub

- Repository: https://github.com/onigogames-debug/mukimuki-trade
- Branch: `main`
- Remote: `https://github.com/onigogames-debug/mukimuki-trade.git`

## Cloudflare Pages

- Account: `onigo.games@gmail.com`
- Project: `mukimuki-trade`
- Production URL: https://mukimuki-trade.pages.dev
- Latest deployment URL: https://c64ac0bd.mukimuki-trade.pages.dev
- Deployment method: Wrangler direct upload

## Custom Domains

Added to Cloudflare Pages:

- `mukimuki-trade.com` - active / SSL enabled
- `www.mukimuki-trade.com` - verifying / SSL certificate pending

Current DNS setup:

- Registrar: お名前.com
- Nameservers: `ursula.ns.cloudflare.com`, `wesley.ns.cloudflare.com`
- `mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev` (proxied)
- `www.mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev` (DNS only while Cloudflare Pages validates)

Public verification:

- `https://mukimuki-trade.com` returns `HTTP/2 200`
- `www.mukimuki-trade.com` resolves to `mukimuki-trade.pages.dev`
- Cloudflare Pages DNS recheck has been initiated for `www.mukimuki-trade.com`

## Remaining Action

1. Wait for Cloudflare Pages to finish HTTP validation and issue SSL for `www.mukimuki-trade.com`.
2. Confirm `https://www.mukimuki-trade.com` succeeds.
3. After `www` is active, optionally switch the Cloudflare DNS record from DNS only to proxied.
