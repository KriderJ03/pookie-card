# Codex Handoff: Pookie Card

## Original Prompt

> I would like to create a website as a card for my CS girl friend. I want it to be hosted as a git repo that you connect to. Please get this setup[$github](app://connector_76869538009648d5b282a4bb21c3d157) Here's the order of how the website should work:
>
> First it has a picture of a card that when you click on it, it has you log in. She won't know the password so then 2 metal doors will close and block the card. she will have to answer 3 questions. When she gets them all correct, it will have her answer a captcha with 9 photos that she has to select from. Then it will send her an email for 2 factor authentication. Then it will open the card. after she enters the code from the email. then the card will open and will play music in the background.

## Current State

- GitHub repo: https://github.com/KriderJ03/pookie-card
- Live site: https://kriderj03.github.io/pookie-card/
- Local project folder on the original machine: `C:\Users\Cindy\Documents\Pookie Card`
- Main branch: `main`
- Latest setup commit when this handoff was created: `9710812 Document cloud setup`

The site is a static GitHub Pages project with no build step. It uses:

- `index.html` for the staged card experience.
- `styles.css` for the card, vault, metal doors, quiz, captcha, 2FA, and open-card styling.
- `script.js` for the full interaction flow and easy configuration.
- `assets/card-front.png` for the generated card-front artwork.
- `.github/workflows/pages.yml` for GitHub Pages deployment.

## Implemented Flow

1. The first screen shows a generated CS-romantic card image.
2. Clicking the card opens a fake password prompt.
3. Any password attempt is rejected.
4. Two metal doors close and show `ACCESS DENIED`.
5. The user answers three CS-themed questions.
6. The user completes a 9-tile playful captcha by selecting the heart tiles.
7. The 2FA step starts.
8. In demo mode, the code is shown on-screen.
9. After entering the code, the card opens and background music starts.

Important: this is romantic security theater, not real authentication. The fake password is not collected or sent anywhere.

## 2FA Email Status

The 2FA step is wired for EmailJS, but it is currently in demo mode.

To enable real email sending, edit the `CONFIG.twoFactor` object at the top of `script.js`:

```js
twoFactor: {
  mode: "emailjs",
  toEmail: "her-email@example.com",
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID",
}
```

The EmailJS template should support these variables:

- `{{to_email}}`
- `{{code}}`
- `{{passcode}}`
- `{{girlfriend_name}}`
- `{{from_name}}`

Do not commit private secrets to the repo. EmailJS public keys are browser-facing, but avoid putting anything sensitive in the card answers or page source.

## Hand-Drawn Asset Plan

The user plans to provide hand-drawn assets soon. Likely integration points:

- Replace `assets/card-front.png` with a hand-drawn closed-card image.
- Add hand-drawn captcha tiles or decorations.
- Add hand-drawn open-card page art.
- Potentially replace the generated card look with a more personal scanned/drawn style.

Keep the existing flow and timing unless the new assets call for a redesign.

## How To Continue On Another Computer

Clone the repo:

```powershell
git clone https://github.com/KriderJ03/pookie-card.git
cd pookie-card
```

Preview locally:

```powershell
py -m http.server 4173
```

Open:

```text
http://localhost:4173/
```

Start Codex in that cloned folder and ask it to read this file first.

## Suggested First Message For The New Codex Chat

```text
Please read CODEX_HANDOFF.md first. We are continuing the Pookie Card project.
The live repo is https://github.com/KriderJ03/pookie-card and the site is
https://kriderj03.github.io/pookie-card/. I want to keep the existing staged
card flow, but I will be adding hand-drawn assets and want you to integrate
them cleanly into the site.
```

