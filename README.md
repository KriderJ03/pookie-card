# Pookie Card

A static GitHub Pages card with a playful security-gauntlet flow:

1. Click the card.
2. Try the fake password screen.
3. Answer three questions.
4. Solve the 9-photo captcha.
5. Enter a 2FA code.
6. Open the card and start the background music.

## Customize

Edit `CONFIG` at the top of `script.js`.

- `girlfriendName` and `fromName` change the message details.
- `quiz` controls the three questions and accepted answers.
- `captcha.correctTiles` controls which photo tiles must be selected.
- `twoFactor` controls the email-code step.

## Email 2FA

GitHub Pages is static, so it cannot send email by itself. This project is wired
for EmailJS, which can send a simple email from the browser.

To enable real email delivery:

1. Create an EmailJS account at https://www.emailjs.com/.
2. Add an email service.
3. Create a template with these variables: `{{to_email}}`, `{{code}}`,
   `{{girlfriend_name}}`, and `{{from_name}}`.
4. In `script.js`, set:

```js
twoFactor: {
  mode: "emailjs",
  toEmail: "her-email@example.com",
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID",
}
```

Until those values are added, the page uses demo mode and shows the code on
screen so the whole card can be tested.

This is meant to be romantic security theater, not real authentication. Do not
put private secrets, real passwords, or sensitive answers in a public repo.

## Run locally

From this folder:

```powershell
py -m http.server 4173
```

Then open http://localhost:4173/.

## Publish With GitHub Pages

After this folder is pushed to GitHub:

1. Open the repo on GitHub.
2. Go to Settings > Pages.
3. Set the source to GitHub Actions.
4. Push to `main`; the included workflow deploys the site.

The local remote is already set to:

```powershell
https://github.com/KriderJ03/pookie-card.git
```

After creating that empty repo on GitHub, push with:

```powershell
git push -u origin main
```
