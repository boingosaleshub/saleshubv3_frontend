# Ookla Cell Analytics Playwright Automation

## Technical Documentation

**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Status:** Works locally, requires Render.com deployment for production

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Specification](#api-specification)
4. [Automation Flow](#automation-flow)
5. [Anti-Detection Features](#anti-detection-features)
6. [File Structure](#file-structure)
7. [Frontend Integration](#frontend-integration)
8. [Known Limitations](#known-limitations)
9. [Deployment Guide](#deployment-guide)

---

## Overview

This automation system captures cell coverage screenshots from [Ookla Cell Analytics](https://cellanalytics.ookla.com) for specified addresses. It uses **Playwright** to control a Chromium browser, login to Ookla, navigate to a location, configure map settings, and capture screenshots for different coverage views (Indoor, Outdoor, Indoor & Outdoor).

### What It Does

1. Logs into Ookla Cell Analytics with provided credentials
2. Navigates to user-specified address on the map
3. Selects carriers (AT&T, Verizon, T-Mobile) based on user choice
4. Configures LTE RSRP coverage display
5. Captures screenshots for selected coverage types
6. Returns screenshots as base64-encoded data

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                          │
│                                                                     │
│  /coverage-plot/new-form/create-coverage-plot-form.jsx             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  User fills form:                                            │   │
│  │  - Address (e.g., "123 Main St, New York, NY")               │   │
│  │  - Carriers: AT&T ☑, Verizon ☑, T-Mobile ☐                  │   │
│  │  - Coverage Type: Indoor ☑, Outdoor ☑                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                    POST /api/coverage-plot/automate                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend API (route.js)                           │
│                                                                     │
│  1. Launch Chromium browser (headless: false)                       │
│  2. Login to cellanalytics.ookla.com                               │
│  3. Enter address in search                                         │
│  4. Select carriers & LTE options                                   │
│  5. Switch coverage views & capture screenshots                     │
│  6. Return base64 screenshots                                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Response to Frontend                           │
│                                                                     │
│  {                                                                  │
│    "success": true,                                                 │
│    "screenshots": [                                                 │
│      { "filename": "ookla_INDOOR_...", "buffer": "base64..." },    │
│      { "filename": "ookla_OUTDOOR_...", "buffer": "base64..." }    │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Specification

### Endpoint

```
POST /api/coverage-plot/automate
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | ✅ | Full address to search on Ookla map |
| `carriers` | string[] | ✅ | Array of carrier names to select |
| `coverageTypes` | string[] | ✅ | Array of coverage view types |

**Valid Carriers:**
- `"AT&T"`
- `"Verizon"`
- `"T-Mobile"`

**Valid Coverage Types:**
- `"Indoor"` - Captures Indoor View screenshot
- `"Outdoor"` - Captures Outdoor View screenshot
- `"Indoor & Outdoor"` - Captures combined Outdoor & Indoor View

**Example Request:**
```json
{
  "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500",
  "carriers": ["AT&T", "Verizon"],
  "coverageTypes": ["Indoor", "Outdoor"]
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "screenshots": [
    {
      "filename": "ookla_INDOOR_1600_Pennsylvania_Avenue_2024-12-30T08-30-45Z.png",
      "buffer": "iVBORw0KGgoAAAANSUhEUgAAA..."
    },
    {
      "filename": "ookla_OUTDOOR_1600_Pennsylvania_Avenue_2024-12-30T08-30-52Z.png",
      "buffer": "iVBORw0KGgoAAAANSUhEUgAAB..."
    }
  ]
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Missing required `address` field |
| 401 | Login to Ookla failed |
| 500 | Browser/automation error |

```json
{
  "success": false,
  "error": "Address is required"
}
```

---

## Automation Flow

The automation follows these steps in sequence:

### Step 1: Browser Launch
```javascript
browser = await chromium.launch({
  headless: false,
  slowMo: 50,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-dev-shm-usage',
  ],
});
```

### Step 2: Context Creation
Creates browser context with:
- Viewport: 1280x720
- User Agent: Chrome 120 on Windows 10
- Locale: en-US
- Timezone: America/New_York
- Geolocation: New York coordinates

### Step 3: Login to Ookla
- Navigate to `https://cellanalytics.ookla.com/login`
- Enter credentials with human-like typing
- Submit form and wait for redirect

### Step 4: Configure Map View
- Open Layers control panel
- Select "Day" map view (4th radio option)

### Step 5: Search Address
- Enter address in search input with human-like typing
- Press Enter to navigate map

### Step 6: Select Carriers
1. Open "Network Provider" accordion
2. Uncheck all carriers first
3. Check only selected carriers (AT&T US, Verizon, T-Mobile US)

### Step 7: Configure LTE Options
1. Open "LTE" accordion
2. Check "RSRP" option
3. Uncheck all other LTE options (RSRQ, SNR, CQI)

### Steps 8-10: Capture Screenshots

For each selected coverage type:

1. **Open Indoor/Outdoor dropdown**
2. **Select view** (Indoor View / Outdoor View / Outdoor & Indoor)
3. **Click zoom button twice** (zoom into location)
4. **Click collapse button** (hide side panels for cleaner screenshot)
5. **Capture screenshot** of content area
6. **Store as base64** in response array

### Step 11: Cleanup
- Close browser
- Return JSON response with all screenshots

---

## Anti-Detection Features

The automation includes several measures to avoid bot detection:

### 1. Human-Like Typing
```javascript
async function humanTypeLocator(locator, text, page) {
  await locator.click();
  await page.waitForTimeout(randomDelay(80, 150));
  for (const char of text) {
    await locator.type(char, { delay: 0 });
    await page.waitForTimeout(randomDelay(30, 70));
  }
}
```

### 2. Natural Mouse Movement
```javascript
async function humanClick(page, locator) {
  const box = await locator.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2 + randomDelay(-5, 5);
    const targetY = box.y + box.height / 2 + randomDelay(-3, 3);
    await page.mouse.move(targetX, targetY, { steps: randomDelay(2, 3) });
    await page.waitForTimeout(randomDelay(30, 80));
  }
  await locator.click();
}
```

### 3. Stealth Scripts
```javascript
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {} };
});
```

### 4. Randomized Delays
- Short wait: 200-400ms
- Medium wait: 500-900ms
- Long wait: 1200-2000ms

---

## File Structure

```
saleshubv3_frontend/
├── src/
│   └── app/
│       ├── api/
│       │   └── coverage-plot/
│       │       └── automate/
│       │           └── route.js          # Playwright automation (825 lines)
│       │
│       └── coverage-plot/
│           └── new-form/
│               ├── page.js               # Page wrapper
│               ├── create-coverage-plot-form.jsx  # Form UI (411 lines)
│               └── coverage-map.jsx      # Map component
│
├── public/
│   └── success.gif                       # Loading animation
│
└── docs/
    └── OOKLA_AUTOMATION.md               # This documentation
```

---

## Frontend Integration

### Form Component Location
`src/app/coverage-plot/new-form/create-coverage-plot-form.jsx`

### Key States
```javascript
const [address, setAddress] = useState("")
const [carrierRequirements, setCarrierRequirements] = useState({
  "AT&T": false,
  "Verizon": false,
  "T-Mobile": false
})
const [coverageType, setCoverageType] = useState({
  "Indoor": false,
  "Outdoor": false,
  "Indoor & Outdoor": false
})
const [isLoading, setIsLoading] = useState(false)
```

### API Call (Line 156-167)
```javascript
const response = await fetch('/api/coverage-plot/automate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: address.trim(),
    carriers: selectedCarriers,
    coverageTypes: selectedCoverageTypes
  })
})
```

### Screenshot Download (Line 178-197)
```javascript
for (const screenshot of data.screenshots) {
  const byteCharacters = atob(screenshot.buffer)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'image/png' })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = screenshot.filename
  a.click()
}
```

---

## Known Limitations

### ⚠️ Vercel Deployment Issue

**Problem:** Playwright cannot run on Vercel serverless functions.

**Error Message:**
```
browserType.launch: Executable doesn't exist at 
/home/sbx_user1051/cache/ms-playwright/chromium-1200/chrome-linux64/chrome
```

**Cause:**
- Vercel serverless functions don't have browser binaries
- Playwright browsers (~200MB) exceed Vercel's 50MB limit
- Function timeout is too short for browser automation

**Solution:** Deploy the automation to Render.com as a dedicated backend service (see Deployment Guide below).

### Other Limitations

1. **Credentials hardcoded** - Currently using `zjanparian` / `Boingo2025!`
2. **Non-headless mode** - Runs with visible browser (`headless: false`)
3. **Fixed viewport** - 1280x720 resolution
4. **Single concurrent session** - No parallel automation support

---

## Deployment Guide

### Current State (Works Locally Only)

```bash
# Install dependencies
npm install playwright

# Install browser binaries
npx playwright install chromium

# Run development server
npm run dev
```

### Production Deployment (Render.com)

To make this work in production, deploy the automation endpoint to Render.com:

1. **Create `playwright-backend/` subfolder** with:
   - Express.js server
   - Dockerfile with Chromium
   - The automation logic from `route.js`

2. **Deploy to Render:**
   - Connect GitHub repo
   - Set Root Directory: `playwright-backend`
   - Environment: Docker

3. **Update Frontend:**
   - Change API URL to Render backend
   - Add `NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL` env variable

---

## Credentials

| Service | Username | Password |
|---------|----------|----------|
| Ookla Cell Analytics | zjanparian | Boingo2025! |

> ⚠️ **Security Note:** These credentials should be moved to environment variables in production.

---

## Quick Reference

### Run Locally
```bash
npm run dev
# Navigate to /coverage-plot/new-form
```

### Test API
```bash
curl -X POST http://localhost:3000/api/coverage-plot/automate \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main St, NY","carriers":["AT&T"],"coverageTypes":["Indoor"]}'
```

### Execution Time
- **Per coverage type:** ~15-30 seconds
- **Total (3 types):** ~60-90 seconds

---

## Author

SalesHub v3 Development Team  
Boingo Wireless

