# Surgronic Control Center (Super Admin)

Internal admin panel for Surgronic. **Never indexed, never linked publicly.**

- **URL:** https://ocbddd-afk.github.io/surgronic-admin/
- **Data source:** `assets/catalog-data-v2.json` — byte-identical to the website catalogue (8,658 products, verified by SHA-256). The live website additionally reads the Cloudflare D1 database via API (8,765 rows incl. 109 legacy products); the JSON bypass covers the 8,658 expansion products.

## 1. Login — email + password + 2FA code

1. Open the admin URL. You see a sign-in card (EN/FR/AR switcher, top-left).
2. Enter your admin email and password → a **6-digit code** is emailed to you.
3. Enter the code within **10 minutes** (single use). A countdown is shown; you can resend after 60s.
4. You stay signed in for the browser tab session only. **Sign out** from the sidebar.

### First-time setup (Ham — do this once per admin)

Passwords are **never stored** — only salted SHA-256 hashes live in `index.html`:

```bash
cd ~/workspace/surgronic/netlify-deploy/admin
node set-admin-password.js "YourStrongPassword123!" "sg-yusuf-01"
# paste the printed sha256 into ADMIN_USERS → yusuf@surgronic.com → passHash
node set-admin-password.js "AnotherStrongPassword456!" "sg-younesse-01"
# paste into bouziani00@gmail.com → passHash
git add index.html && git commit -m "Set admin password hashes" && git push
```

### Email delivery (FormSubmit — free, no account)

Codes are sent via [FormSubmit.co](https://formsubmit.co) AJAX — free forever, no API key.

- **One-time activation:** the first code ever sent triggers an activation email from FormSubmit to that address. Open the link once, then press **Resend code**. The login screen tells you if this is needed.
- If email fails, the UI falls back to showing the activation hint — codes are generated regardless, so once FormSubmit is activated the flow is smooth.

### Security notes (read before production)

- Codes live **only in page memory** — a reload discards any pending code (by design).
- Rate limiting is client-side (5 failed attempts → 60s lockout). A server-side gate (Cloudflare Access or a Worker) is the proper long-term control — see `SUPER-ADMIN-DIRECTIVE.md`.
- Recommended next step: put this host behind **Cloudflare Access** (Ham's dashboard) so the login page itself is only reachable by the team.

## 2. Integrations

| Integration | Doc | Status |
|---|---|---|
| Gmail (send RFQ + 2FA mail via Gmail API) | [GMAIL-INTEGRATION.md](GMAIL-INTEGRATION.md) | Documented, ready to wire |
| Facebook Login (alternative sign-in) | [FACEBOOK-INTEGRATION.md](FACEBOOK-INTEGRATION.md) | Documented, ready to wire |

## 3. Files

| File | Purpose |
|---|---|
| `index.html` | Login gate (2FA) + dashboard |
| `assets/catalog-data-v2.json` | Shared catalogue (8,658 products) |
| `set-admin-password.js` | Local password-hash generator (never commit passwords) |
| `GMAIL-INTEGRATION.md` | Gmail API setup guide |
| `FACEBOOK-INTEGRATION.md` | Facebook Login setup guide |
