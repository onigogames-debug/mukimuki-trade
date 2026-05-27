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
- Latest deployment URL: https://2c68619d.mukimuki-trade.pages.dev
- Deployment method: Wrangler direct upload

## Custom Domains

Added to Cloudflare Pages:

- `mukimuki-trade.com` - active / SSL enabled
- `www.mukimuki-trade.com` - active / SSL enabled

Current DNS setup:

- Registrar: お名前.com
- Nameservers: `ursula.ns.cloudflare.com`, `wesley.ns.cloudflare.com`
- `mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev` (proxied)
- `www.mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev`

Public verification:

- `https://mukimuki-trade.com` returns `HTTP/2 200`
- `https://www.mukimuki-trade.com` returns `HTTP/2 200`

## Remaining Action

No domain action remains. Both apex and `www` custom domains return `HTTP/2 200`.
