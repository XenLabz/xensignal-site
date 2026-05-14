# XenSignal Site

Static XenSignal landing page and shadow dashboard for cPanel hosting.

## Live target

```text
https://xensignal.xenlabz.com
```

## cPanel deploy target

```text
/home/stopazi/public_html/xensignal/
```

## Structure

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
```

## cPanel Git deployment

Clone this repo in cPanel Git Version Control outside the public web root, then use:

```text
Update from Remote
Deploy HEAD Commit
```

The `.cpanel.yml` file deploys `public/` into:

```text
/home/stopazi/public_html/xensignal/
```
