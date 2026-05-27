# MUKIMUKI trade

株式投資の実績公開、銘柄研究、相場雑談、証券会社アフィリエイト導線を持つ静的サイトです。

## ローカル確認

```sh
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173/` を開きます。

## GitHub

想定リポジトリ:

- GitHub account: `onigogames-debug`
- Repository name: `mukimuki-trade`
- Default branch: `main`

## Cloudflare Pages

想定設定:

- Cloudflare account: `onigo.games@gmail.com`
- Project name: `mukimuki-trade`
- Production branch: `main`
- Framework preset: `None`
- Build command: 空欄
- Build output directory: `/`

## Custom Domain

想定ドメイン:

- Primary: `mukimuki-trade.com`
- Redirect: `www.mukimuki-trade.com` -> `mukimuki-trade.com`

Cloudflare Pages側でCustom domainに `mukimuki-trade.com` を追加し、必要に応じて `www.mukimuki-trade.com` も追加します。DNSはCloudflare側に移管するか、Cloudflareが指定するCNAMEをお名前.com側に設定します。

## 公開前チェック

- アフィリエイトリンクを本番URLへ差し替える
- 実績数値がサンプルである箇所を実データへ差し替える
- プライバシーポリシー、免責事項、運営者情報ページを追加する
- Google Search Console / Analytics / Cloudflare Web Analyticsを設定する
