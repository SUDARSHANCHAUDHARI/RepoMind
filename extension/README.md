# RepoMind AI — Chrome Extension

## Setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder

## Usage

1. Open any GitHub repo (e.g. `https://github.com/vercel/next.js`)
2. Click the RepoMind AI extension icon
3. Click **Analyze this repo**
4. View stack, architecture, and core features in the popup
5. Click **Open Full Analysis** to see the complete breakdown on the web app

## Production

In `popup.js`, change:
```js
const APP_URL = "http://localhost:3000";
```
to your deployed URL, e.g.:
```js
const APP_URL = "https://YOUR_APP_DOMAIN";
```

## Icons

Add `icon16.png`, `icon48.png`, `icon128.png` to this folder.
You can generate them from any square logo image.
