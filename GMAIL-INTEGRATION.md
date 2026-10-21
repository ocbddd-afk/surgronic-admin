# Gmail Integration — Surgronic Control Center

**Cost: free.** Uses the Gmail API to send RFQ notifications and 2FA codes from a
Surgronic mailbox (e.g. `yusuf@surgronic.com`) instead of FormSubmit.

## Why

- Codes and RFQ alerts come **from your own address** (better deliverability, on-brand).
- One API covers both the admin 2FA flow and website RFQ notifications.
- Data collected: sent-message metadata only — kept for future customer analytics.

## Setup (one time, ~15 min, Ham's Google account)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create project
   **"Surgronic"**.
2. **APIs & Services → Library** → enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Surgronic Control Center`, support email: `yusuf@surgronic.com`
   - Scopes: `.../auth/gmail.send` (send-only — least privilege)
   - Test users: add `yusuf@surgronic.com` and `bouziani00@gmail.com`
   - (Publish the app later to remove the test-user cap.)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://ocbddd-afk.github.io`
   - Copy the **Client ID**.
5. Sign in once with the mailbox that will send (yusuf@surgronic.com) to grant
   `gmail.send`.

## Wiring into the admin (drop-in)

Add to `index.html` (replacing the FormSubmit call in `sendCodeEmail`):

```html
<script src="https://apis.google.com/js/api.js"></script>
<script>
const GMAIL_CLIENT_ID = "PASTE_CLIENT_ID.apps.googleusercontent.com";
let gapiToken = null;

function gmailInit(){
  gapi.load("client:auth2", async ()=>{
    await gapi.client.init({ clientId: GMAIL_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.send",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"] });
  });
}
async function gmailSend(to, subject, bodyText){
  const auth = gapi.auth2.getAuthInstance();
  if(!auth.isSignedIn.get()) await auth.signIn();           // one-time per session
  const raw = btoa("To: "+to+"\r\nSubject: "+subject+
                   "\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n"+bodyText)
                   .replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  await gapi.client.gmail.users.messages.send({ userId:"me", resource:{ raw } });
}
// then: sendCodeEmail = (email, code) =>
//   gmailSend(email, "Surgronic Control Center — your verification code",
//             "Your verification code is: "+code+"\n\nValid for 10 minutes, single use.");
</script>
```

## RFQ notifications (website → Gmail)

The same `gmailSend` helper can notify `yusuf@surgronic.com` on every submitted
RFQ: subject `New RFQ — <name> (<country>)`, body = item SKUs × quantities +
contact details. Wire it into the quote-form success handler in
`v2-redesign/quote.html` once Ham approves.

## Limits (free tier)

- Gmail API: **500 sends/day** (more than enough for 2FA + RFQ alerts).
- OAuth tokens are per-session; no secrets are committed to git.

## Collected data (for future use)

- Recipient, timestamp, subject of each sent code/notification.
- Store server-side later (D1 `email_log` table) for delivery analytics.
