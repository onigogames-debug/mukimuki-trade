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
- Latest deployment URL: https://f23ef0d5.mukimuki-trade.pages.dev
- Deployment method: Wrangler direct upload

## Custom Domains

Added to Cloudflare Pages:

- `mukimuki-trade.com` - pending DNS validation
- `www.mukimuki-trade.com` - pending DNS validation

Current public DNS check:

- `mukimuki-trade.com` nameservers: `dns1.onamae.com`, `dns2.onamae.com`
- `mukimuki-trade.com` A record: `150.95.255.38`
- `www.mukimuki-trade.com` CNAME: not set

Cloudflare Pages apex domain activation requires the domain to be added as a Cloudflare DNS zone and the registrar nameservers to be changed from お名前.com defaults to the Cloudflare-assigned nameservers.

## Remaining Action

1. Add `mukimuki-trade.com` as a website/DNS zone in Cloudflare.
2. Copy the two Cloudflare-assigned nameservers.
3. In お名前.com, change the domain nameservers to the Cloudflare nameservers.
4. Wait for DNS propagation.
5. Confirm both custom domains change from `pending` to `active` in Cloudflare Pages.
