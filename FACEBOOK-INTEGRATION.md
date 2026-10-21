# Facebook Login — Surgronic Control Center

**Cost: free.** Adds "Continue with Facebook" as an alternative sign-in on the
admin login card. The 2FA email-code step still applies afterwards (defense in depth).

## Why

- One-tap sign-in for the founders; no extra password to remember.
- Collects basic profile data (name, email, profile picture URL) — useful later
  for marketing audiences and customer identity matching.
- Free forever; no paid tier involved.

## Setup (one time, ~15 min)

1. Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps →
   Create App** → type **Business**, name `Surgronic Control Center`.
2. **Add Product → Facebook Login** → platform **Web**.
3. **Facebook Login → Settings**
   - Valid OAuth Redirect URIs: `https://ocbddd-afk.github.io/surgronic-admin/`
   - (Add the future custom domain too, e.g. `https://admin.surgronic.com/`, when set.)
4. **Settings → Basic** → copy the **App ID**. Add Privacy Policy URL
   (`https://ocbddd-afk.github.io/surgronic-website/privacy.html`) and app icon.
5. Permissions requested: `public_profile`, `email` (both auto-granted, no review).
   Requesting anything more triggers App Review — **don't**.
6. Switch the app to **Live** when ready (needs a verified Business account for
   non-test users; while in Development mode, add the founders under Roles).

## Wiring into the admin (drop-in)

Add a button under the password form in `index.html`:

```html
<script async defer crossorigin="anonymous"
  src="https://connect.facebook.net/en_US/sdk.js"></script>
<script>
const FB_APP_ID = "PASTE_APP_ID";
window.fbAsyncInit = function(){
  FB.init({ appId: FB_APP_ID, cookie: false, xfbml: false, version: "v21.0" });
};
function facebookLogin(){
  FB.login(function(resp){
    if(resp.status !== "connected") return;              // user cancelled
    FB.api("/me", { fields: "name,email,picture" }, function(profile){
      // profile = { name, email, picture.data.url }
      // 1. Check profile.email is in ADMIN_USERS (never trust client-side alone).
      // 2. Store {name, email, picture} for future marketing use.
      // 3. Issue the 2FA email code as usual, then show the code step.
      const user = ADMIN_USERS.find(u => u.email === (profile.email||"").toLowerCase());
      if(!user){ showErr(t("login.errCreds")); return; }
      const code = issueCode(user.email);
      sendCodeEmail(user.email, code)
        .then(()=>{ showOk(t("login.codeSent")); showStep2(); })
        .catch(()=>{ showErr(t("login.activation")); showStep2(); });
    });
  }, { scope: "public_profile,email" });
}
</script>
<button class="btn-ghost" onclick="facebookLogin()">Continue with Facebook</button>
```

`issueCode`, `sendCodeEmail`, `showStep2`, `showOk/Err` already exist in `index.html`.

## Data collected (for future use)

| Field | Source | Future use |
|---|---|---|
| `name` | Facebook profile | Personalized outreach, quote headers |
| `email` | Facebook profile (verified) | Identity matching with RFQ senders |
| `picture.data.url` | Facebook profile | Admin avatar (internal only) |

- Store only after the admin consents on first login (add a checkbox later).
- **Never** publish profile data on the public site. Internal/marketing use only.

## Limits & notes

- Free tier has no hard login cap for this scale.
- Keep the app in **Development** until the Business account is verified.
- If Facebook changes SDK versions, pin `version` in `FB.init` and test.
