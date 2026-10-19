# RepoMind AI — Chrome Extension

## Setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder

## Usage

1. Open any GitHub repo (e.g. `https://github.com/facebook/react`)
2. Click the RepoMind AI extension icon
3. Click **Analyze this repo**
4. View stack, architecture, and core features in the popup
5. Click **Open Full Analysis** to see the complete breakdown on the web app

## App URL

The extension calls the deployed app at `https://repomind.sudarshantechlabs.com` by default
(`DEFAULT_APP_URL` in `config.js`).

To point it somewhere else, for example `http://localhost:3000` during local development:

1. Open `chrome://extensions`, find RepoMind AI and click **Details** → **Extension options**
   (or right-click the toolbar icon → **Options**).
2. Enter the app URL and click **Save**. **Reset to default** restores the deployed URL.

The setting is stored in `chrome.storage.sync`, so it survives reloads of the unpacked extension.

## Icons

Add `icon16.png`, `icon48.png`, `icon128.png` to this folder.
You can generate them from any square logo image.
