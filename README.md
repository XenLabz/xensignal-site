# XenSignal cPanel Site

This package is a static XenSignal microsite and shadow-dashboard viewer for hosting under XenLabz.com on Namecheap/cPanel.

## Recommended URL

Use one of these:

```text
https://xensignal.xenlabz.com
```

or:

```text
https://xenlabz.com/xensignal
```

The subdomain is cleaner.

## What is included

```text
public/
  index.html
  dashboard.html
  assets/
    style.css
    dashboard.js
  reports/
    latest-shadow-summary.json
    latest-optimizer-state.json
  .htaccess

.cpanel.yml
scripts/
  publish_reports_example.sh
```

## cPanel setup option A: File Manager upload

1. In cPanel, create a subdomain:
   - Subdomain: `xensignal`
   - Domain: `xenlabz.com`
   - Document root: `public_html/xensignal`

2. Upload everything inside the `public/` folder into:

```text
public_html/xensignal/
```

3. Visit:

```text
https://xensignal.xenlabz.com
```

4. Open:

```text
https://xensignal.xenlabz.com/dashboard.html
```

## cPanel setup option B: Git deployment

1. Create a GitHub repo named something like:

```text
xensignal-site
```

2. Push this full package to GitHub.

3. In cPanel, open Git Version Control and clone the repo.

4. Edit `.cpanel.yml` and replace:

```text
YOUR_CPANEL_USERNAME
```

with your actual cPanel username.

5. Deploy from cPanel.

## Publishing fresh reports

The dashboard reads:

```text
public/reports/latest-shadow-summary.json
public/reports/latest-optimizer-state.json
```

Replace those files with real XenSignal exports.

The dashboard does not run the trading engine. That is intentional. Shared cPanel hosting should display the evidence, not pretend to be a live trading backend.

## Privacy

For a private dashboard, use:

```text
cPanel > Directory Privacy
```

Protect:

```text
public_html/xensignal/
```

or at least:

```text
public_html/xensignal/dashboard.html
public_html/xensignal/reports/
```

Depending on your cPanel version, directory privacy usually protects folders, not individual files. Protecting the full subdomain root is simplest.

## Notes

- This is static HTML/CSS/JS.
- No server-side code is required.
- No database is required.
- No secrets should be placed in these files.
- Do not upload API keys, Kalshi credentials, brokerage credentials, or local `.env` files.
