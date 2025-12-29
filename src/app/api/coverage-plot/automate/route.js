import { chromium } from 'playwright';

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Human-like wait - simulates natural pauses with slight variations (faster)
async function humanWait(page, baseMs) {
  // Add 10-30% variation to make it feel more natural
  const variation = baseMs * (0.1 + Math.random() * 0.2);
  const actualDelay = Math.floor(baseMs + (Math.random() > 0.5 ? variation : -variation * 0.3));
  await page.waitForTimeout(Math.max(actualDelay, 80)); // Minimum 80ms
}

// Simulate human-like typing for a locator element (faster typing)
async function humanTypeLocator(locator, text, page) {
  await locator.click();
  await page.waitForTimeout(randomDelay(80, 150));

  for (const char of text) {
    await locator.type(char, { delay: 0 });
    // Faster typing but still variable (30-70ms between keystrokes)
    await page.waitForTimeout(randomDelay(30, 70));
  }
}

// Move mouse to element in a faster but still natural path before clicking
async function humanClick(page, locator) {
  const box = await locator.boundingBox();
  if (box) {
    // Target position with slight randomness (don't always click dead center)
    const targetX = box.x + box.width / 2 + randomDelay(-5, 5);
    const targetY = box.y + box.height / 2 + randomDelay(-3, 3);

    // Quick but natural mouse move (fewer intermediate steps)
    await page.mouse.move(targetX, targetY, { steps: randomDelay(2, 3) });
    await page.waitForTimeout(randomDelay(30, 80));
  }
  await locator.click();
}

// Short wait for element interactions (faster but still natural)
async function shortWait(page) {
  await page.waitForTimeout(randomDelay(200, 400));
}

// Medium wait for page transitions/loads
async function mediumWait(page) {
  await page.waitForTimeout(randomDelay(500, 900));
}

// Longer wait for heavy content loading
async function longWait(page) {
  await page.waitForTimeout(randomDelay(1200, 2000));
}

export async function POST(request) {
  let browser;

  try {
    const { address, carriers, coverageTypes } = await request.json();

    if (!address) {
      return Response.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Launch browser with stealth settings
    browser = await chromium.launch({
      headless: false,
      slowMo: 50, // Reduced from 100ms - human behavior is handled separately
      args: [
        '--disable-blink-features=AutomationControlled', // Hide automation flag
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
      ],
    });

    // Create context with realistic browser fingerprint
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      geolocation: { longitude: -73.935242, latitude: 40.730610 },
      permissions: ['geolocation'],
    });

    // Add stealth scripts to avoid detection
    await context.addInitScript(() => {
      // Override webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override plugins to look more realistic
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Add chrome property (real browsers have this)
      window.chrome = {
        runtime: {},
      };
    });

    const page = await context.newPage();

    console.log('Step 1: Navigating to login page...');
    await page.goto('https://cellanalytics.ookla.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    // Wait for the login form to be visible
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // Small pause before starting to type (human would read the page first)
    await humanWait(page, 800);

    console.log('Step 2: Filling in credentials with human-like typing...');

    // Human-like credential entry
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    // Click and wait like a human would
    await humanClick(page, usernameInput);
    await shortWait(page);
    await humanTypeLocator(usernameInput, 'zjanparian', page);

    // Pause between username and password (human would move mouse/look at screen)
    await humanWait(page, 500);

    await humanClick(page, passwordInput);
    await shortWait(page);
    await humanTypeLocator(passwordInput, 'Boingo2025!', page);

    // Short pause before clicking submit (human would verify entries)
    await humanWait(page, 600);

    console.log('Step 3: Submitting login form...');
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    await humanClick(page, submitButton);

    // Wait for navigation after login
    try {
      await page.waitForURL('**/cellanalytics.ookla.com/**', { timeout: 30000 });
      console.log('✓ Redirected to dashboard');
    } catch (error) {
      console.log('Navigation wait timeout, checking URL...');
    }

    // Reduced wait for page settle - let Playwright handle most of it
    await longWait(page);

    const currentUrl = page.url();
    const loginSuccess = !currentUrl.includes('/login');

    if (loginSuccess) {
      console.log('✓ Login successful!');
      console.log('Current URL:', currentUrl);

      // Step 4: Open Layers control and change map view to "Day" - INSTANT (no dashboard wait)
      console.log('Step 4: Changing map view to Day...');
      try {
        // Wait for Layers button to appear (short timeout - it should be there quickly)
        const layersToggle = page.locator('a.leaflet-control-layers-toggle[title="Layers"]');
        await layersToggle.waitFor({ state: 'attached', timeout: 8000 });

        // Hover to open dropdown
        await layersToggle.hover();

        // Click Day radio with force - 4th option (index 3)
        const dayRadioInput = page.locator('input[type="radio"].leaflet-control-layers-selector[name="leaflet-base-layers"]').nth(3);
        await dayRadioInput.click({ force: true, timeout: 2000 });
        console.log('✓ Day view selected');

        // Move mouse away
        await page.mouse.move(100, 100);

      } catch (error) {
        console.log('Day view switch error, trying alternatives...', error.message);

        // Try alternative selectors
        try {
          // Try clicking by evaluating in page context for maximum speed
          await page.evaluate(() => {
            const radios = document.querySelectorAll('input[type="radio"].leaflet-control-layers-selector');
            if (radios[3]) radios[3].click();
          });
          console.log('✓ Day view selected (via evaluate)');
        } catch (e1) {
          try {
            // Last resort: click label with Day text
            await page.click('label:has-text("Day")', { force: true, timeout: 1000 });
            console.log('✓ Day view selected (via label)');
          } catch (e2) {
            console.log('Note: Could not change to Day view');
          }
        }
      }

      // Step 5: Enter address in search field
      console.log('Step 5: Entering address:', address);

      // Find the address input field (the one in the search bar at the top)
      const addressInput = page.locator('input[type="text"]').first();

      await addressInput.waitFor({ timeout: 10000 });

      // Click to focus with human-like movement
      await humanClick(page, addressInput);
      await shortWait(page);

      // Clear any existing text using keyboard shortcut
      await addressInput.press('Control+A');
      await page.waitForTimeout(randomDelay(150, 300));

      // Type the address with human-like rhythm
      await humanTypeLocator(addressInput, address, page);
      console.log('✓ Address entered:', address);

      await mediumWait(page);

      // Press Enter to search and navigate map
      await addressInput.press('Enter');
      console.log('✓ Enter pressed to search location');

      // Wait for the map to navigate to the location (needs more time for map load)
      await longWait(page);
      await mediumWait(page);

      // Verify the address is still in the input field
      const inputValue = await addressInput.inputValue();
      console.log('✓ Address in search field:', inputValue);

      // Wait for the map to fully load the location
      await longWait(page);

      // Step 6: Open Network Provider options FIRST
      console.log('Step 6: Opening Network Provider options...');
      const networkProviderToggle = page.locator('text=Network Provider').locator('..').locator('span').first();

      await networkProviderToggle.waitFor({ timeout: 10000 });
      await networkProviderToggle.scrollIntoViewIfNeeded();
      await networkProviderToggle.click();
      console.log('✓ Network Provider section opened');

      // Wait for expansion
      await longWait(page);

      // Step 7: Select/unselect carriers based on user selection
      const carriersToSelect = carriers || [];
      
      // Map of all available carriers with their site labels
      const allCarriers = {
        'AT&T': 'AT&T US',
        'Verizon': 'Verizon',
        'T-Mobile': 'T-Mobile US'
      };

      // First, uncheck all carriers
      console.log('Step 7: Unchecking all carriers first...');
      for (const [userName, siteName] of Object.entries(allCarriers)) {
        try {
          const carrierLabel = page.locator(`label:has-text("${siteName}")`).first();
          await carrierLabel.waitFor({ state: 'visible', timeout: 5000 });
          const carrierLabelFor = await carrierLabel.getAttribute('for');
          const carrierCheckbox = page.locator(`#${carrierLabelFor}`);
          const isChecked = await carrierCheckbox.isChecked();
          if (isChecked) {
            await carrierLabel.click();
            console.log(`  Unchecked ${siteName}`);
            await shortWait(page);
          }
        } catch (error) {
          // Carrier might not exist, continue
        }
      }

      await mediumWait(page);

      // Now, check only the carriers selected by the user
      console.log('Step 7: Selecting user-selected carriers...');
      for (const carrierName of carriersToSelect) {
        console.log(`  Selecting ${carrierName}...`);
        try {
          let carrierLabel;
          
          // Map user-friendly names to actual labels on the site
          if (carrierName === 'T-Mobile' || carrierName === 'T-Mobile US') {
            carrierLabel = page.locator('label:has-text("T-Mobile US")').first();
          } else if (carrierName === 'AT&T') {
            carrierLabel = page.locator('label:has-text("AT&T US")').first();
          } else if (carrierName === 'Verizon') {
            carrierLabel = page.locator('label:has-text("Verizon")').first();
          } else {
            carrierLabel = page.locator(`label:has-text("${carrierName}")`).first();
          }

          await carrierLabel.waitFor({ state: 'visible', timeout: 10000 });

          // Get the checkbox associated with this label
          const carrierLabelFor = await carrierLabel.getAttribute('for');
          const carrierCheckbox = page.locator(`#${carrierLabelFor}`);

          const isChecked = await carrierCheckbox.isChecked();
          if (!isChecked) {
            await carrierLabel.scrollIntoViewIfNeeded();
            await carrierLabel.click();
            console.log(`✓ ${carrierName} selected`);
          } else {
            console.log(`✓ ${carrierName} already selected`);
          }
        } catch (error) {
          console.log(`Error selecting ${carrierName}:`, error.message);
        }

        await mediumWait(page);
      }

      // Step 8: Open LTE options
      console.log('Step 8: Opening LTE options...');
      const lteToggle = page.locator('text=LTE').locator('..').locator('span').first();

      await lteToggle.waitFor({ timeout: 10000 });
      await lteToggle.scrollIntoViewIfNeeded();
      await lteToggle.click();
      console.log('✓ LTE section opened');

      // Wait for the accordion to fully expand and render
      await longWait(page);

      // Step 9: Select ONLY RSRP option
      console.log('Step 9: Selecting ONLY RSRP option...');
      try {
        // Find the RSRP row by looking for the caption text containing "RSRP"
        const rsrpRow = page.locator('tr').filter({ has: page.locator('span.v-captiontext:has-text("RSRP")') });

        // Within that row, find the checkbox input
        const rsrpCheckbox = rsrpRow.locator('input[type="checkbox"]').first();

        await rsrpCheckbox.waitFor({ state: 'attached', timeout: 15000 });

        const isRsrpChecked = await rsrpCheckbox.isChecked();
        if (!isRsrpChecked) {
          await rsrpCheckbox.scrollIntoViewIfNeeded();
          await rsrpCheckbox.check({ force: true });
          console.log('✓ RSRP checkbox selected');
        } else {
          console.log('✓ RSRP already selected');
        }

        await mediumWait(page);

        // Now uncheck any other LTE options that might be selected
        const lteRows = page.locator('tr').filter({
          has: page.locator('span.v-captiontext:text-matches("RSRQ|SNR|CQI", "i")')
        });

        const rowCount = await lteRows.count();
        console.log(`Checking ${rowCount} other LTE options to uncheck...`);

        for (let i = 0; i < rowCount; i++) {
          const row = lteRows.nth(i);
          const checkbox = row.locator('input[type="checkbox"]').first();

          try {
            const isChecked = await checkbox.isChecked();
            if (isChecked) {
              const labelText = await row.locator('span.v-captiontext').first().textContent();
              await checkbox.uncheck({ force: true });
              console.log(`  Unchecked: ${labelText.trim()}`);
              await shortWait(page);
            }
          } catch (e) {
            // Skip if there's any issue with this row
          }
        }

        console.log('✓ RSRP selected, all other LTE options unchecked');
      } catch (error) {
        console.log('Error with RSRP selection:', error.message);
      }

      await mediumWait(page);

      // Determine which views to capture based on coverageTypes
      // User can select: "Indoor", "Outdoor", "Indoor & Outdoor"
      const hasIndoor = coverageTypes?.includes('Indoor');
      const hasOutdoor = coverageTypes?.includes('Outdoor');
      const hasIndoorAndOutdoor = coverageTypes?.includes('Indoor & Outdoor');

      // Determine what screenshots to take:
      // - If "Indoor" checkbox selected → take Indoor screenshot
      // - If "Outdoor" checkbox selected → take Outdoor screenshot
      // - If "Indoor & Outdoor" checkbox selected → take "Outdoor & Indoor" view screenshot (separate option in Ookla)
      const captureIndoor = hasIndoor;
      const captureOutdoor = hasOutdoor;
      const captureIndoorAndOutdoor = hasIndoorAndOutdoor;

      const screenshots = [];

      // Content area selector for screenshots
      const contentAreaSelector = '#ROOT-2521314 > div > div.v-verticallayout.v-layout.v-vertical.v-widget.v-has-width.v-has-height > div > div:nth-child(2) > div > div.v-splitpanel-horizontal.v-widget.v-has-width.v-has-height > div > div.v-splitpanel-second-container.v-scrollable';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);

      // Step 10: Select Indoor View and take screenshot if needed
      if (captureIndoor) {
        console.log('Step 10: Selecting Indoor View...');
        try {
          // Find the Indoor/Outdoor dropdown
          let indoorOutdoorDropdown = page.locator('div.v-filterselect:has(img[src*="inandoutdoor"])');

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect.map-cb').filter({
              has: page.locator('img[src*="indoor"]')
            });
          }

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect-map-cb').first();
          }

          await indoorOutdoorDropdown.waitFor({ state: 'visible', timeout: 10000 });

          const dropdownButton = indoorOutdoorDropdown.locator('div.v-filterselect-button');
          await humanClick(page, dropdownButton);
          console.log('✓ Indoor/Outdoor dropdown clicked');

          await shortWait(page);

          await page.waitForSelector('#VAADIN_COMBOBOX_OPTIONLIST', { state: 'visible', timeout: 5000 });

          const indoorViewOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Indoor View")');
          await indoorViewOption.waitFor({ state: 'visible', timeout: 5000 });
          await indoorViewOption.click();
          console.log('✓ Indoor View selected');

          await mediumWait(page);

        } catch (error) {
          console.log('Error selecting Indoor View (primary):', error.message);
          try {
            await page.evaluate(() => {
              const dropdowns = document.querySelectorAll('div.v-filterselect');
              for (const dropdown of dropdowns) {
                const img = dropdown.querySelector('img[src*="indoor"]');
                if (img) {
                  const button = dropdown.querySelector('div.v-filterselect-button');
                  if (button) button.click();
                  break;
                }
              }
            });

            await shortWait(page);
            await page.click('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Indoor View")', { timeout: 5000 });
            console.log('✓ Indoor View selected (via evaluate method)');
            await mediumWait(page);
          } catch (altError) {
            console.log('Error selecting Indoor View (fallback):', altError.message);
          }
        }

        // Step 11: Click zoom-in button twice
        console.log('Step 11: Clicking zoom-in button twice...');
        try {
          const zoomButtonSelector = '#ROOT-2521314 > div > div.v-verticallayout.v-layout.v-vertical.v-widget.v-has-width.v-has-height > div > div:nth-child(2) > div > div.v-splitpanel-horizontal.v-widget.v-has-width.v-has-height > div > div.v-splitpanel-second-container.v-scrollable > div > div > div > div:nth-child(1) > div > div.v-panel-content.v-scrollable > div > div > div > div:nth-child(1) > div > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div';

          const zoomButton = page.locator(zoomButtonSelector);
          await zoomButton.waitFor({ state: 'visible', timeout: 10000 });

          await humanClick(page, zoomButton);
          console.log('✓ Zoom button clicked (1st time)');
          await mediumWait(page);

          await humanClick(page, zoomButton);
          console.log('✓ Zoom button clicked (2nd time)');
          await mediumWait(page);

        } catch (error) {
          console.log('Error clicking zoom button:', error.message);
          try {
            const altZoomButton = page.locator('div.v-button.v-widget span.v-icon.FontAwesome').first();
            await humanClick(page, altZoomButton);
            await mediumWait(page);
            await humanClick(page, altZoomButton);
            console.log('✓ Zoom button clicked using alternative method');
            await mediumWait(page);
          } catch (altError) {
            console.log('Could not click zoom button with alternative method either:', altError.message);
          }
        }

        // Step 12: Click collapse button
        console.log('Step 12: Clicking collapse button...');
        try {
          const collapseButtonSelector = '#ROOT-2521314 > div > div.v-verticallayout.v-layout.v-vertical.v-widget.v-has-width.v-has-height > div > div:nth-child(2) > div > div.v-splitpanel-horizontal.v-widget.v-has-width.v-has-height > div > div.v-splitpanel-second-container.v-scrollable > div > div > div > div.v-absolutelayout-wrapper.v-absolutelayout-wrapper-expand-component > div > div > div > div';

          const collapseButton = page.locator(collapseButtonSelector);
          await collapseButton.waitFor({ state: 'visible', timeout: 10000 });
          await humanClick(page, collapseButton);
          console.log('✓ Collapse button clicked');
          await mediumWait(page);

        } catch (error) {
          console.log('Error clicking collapse button:', error.message);
          try {
            const altCollapseButton = page.locator('div.v-absolutelayout-wrapper-expand-component div.v-button.v-widget').first();
            await humanClick(page, altCollapseButton);
            console.log('✓ Collapse button clicked using alternative method');
            await mediumWait(page);
          } catch (altError) {
            console.log('Could not click collapse button with alternative method either:', altError.message);
          }
        }

        // Step 13: Take Indoor View screenshot
        console.log('Step 13: Taking Indoor View screenshot...');
        try {
          await mediumWait(page);

          const contentArea = page.locator(contentAreaSelector);
          await contentArea.waitFor({ state: 'visible', timeout: 10000 });

          const indoorScreenshotFilename = `ookla_INDOOR_${sanitizedAddress}_${timestamp}.png`;
          const indoorScreenshotBuffer = await contentArea.screenshot({
            type: 'png'
          });

          screenshots.push({
            filename: indoorScreenshotFilename,
            buffer: indoorScreenshotBuffer.toString('base64')
          });

          console.log('✓ Indoor View screenshot captured successfully');

        } catch (error) {
          console.log('Error taking Indoor screenshot:', error.message);
          try {
            const indoorScreenshotFilename = `ookla_INDOOR_fullpage_${sanitizedAddress}_${timestamp}.png`;
            const indoorScreenshotBuffer = await page.screenshot({
              type: 'png',
              clip: { x: 0, y: 50, width: 1280, height: 670 }
            });

            screenshots.push({
              filename: indoorScreenshotFilename,
              buffer: indoorScreenshotBuffer.toString('base64')
            });

            console.log('✓ Indoor View fallback screenshot captured');
          } catch (fallbackError) {
            console.log('Indoor fallback screenshot failed:', fallbackError.message);
          }
        }
      }

      // Step 14: Select Outdoor View and take screenshot if needed
      if (captureOutdoor) {
        console.log('Step 14: Selecting Outdoor View...');
        try {
          let indoorOutdoorDropdown = page.locator('div.v-filterselect:has(img[src*="inandoutdoor"])');

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect.map-cb').filter({
              has: page.locator('img[src*="indoor"]')
            });
          }

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect-map-cb').first();
          }

          await indoorOutdoorDropdown.waitFor({ state: 'visible', timeout: 10000 });

          const dropdownButton = indoorOutdoorDropdown.locator('div.v-filterselect-button');
          await humanClick(page, dropdownButton);
          console.log('✓ Indoor/Outdoor dropdown clicked');

          await shortWait(page);

          await page.waitForSelector('#VAADIN_COMBOBOX_OPTIONLIST', { state: 'visible', timeout: 5000 });

          const outdoorViewOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Outdoor View")');
          await outdoorViewOption.waitFor({ state: 'visible', timeout: 5000 });
          await outdoorViewOption.click();
          console.log('✓ Outdoor View selected');

          await mediumWait(page);

        } catch (error) {
          console.log('Error selecting Outdoor View (primary):', error.message);
          try {
            await page.evaluate(() => {
              const dropdowns = document.querySelectorAll('div.v-filterselect');
              for (const dropdown of dropdowns) {
                const img = dropdown.querySelector('img[src*="indoor"]');
                if (img) {
                  const button = dropdown.querySelector('div.v-filterselect-button');
                  if (button) button.click();
                  break;
                }
              }
            });

            await shortWait(page);
            await page.click('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Outdoor View")', { timeout: 5000 });
            console.log('✓ Outdoor View selected (via evaluate method)');
            await mediumWait(page);
          } catch (altError) {
            console.log('Error selecting Outdoor View (fallback):', altError.message);
          }
        }

        // Wait for map to update with Outdoor View data
        await longWait(page);

        // Step 15: Take Outdoor View screenshot
        console.log('Step 15: Taking Outdoor View screenshot...');
        try {
          await mediumWait(page);

          const contentArea = page.locator(contentAreaSelector);
          await contentArea.waitFor({ state: 'visible', timeout: 10000 });

          const outdoorScreenshotFilename = `ookla_OUTDOOR_${sanitizedAddress}_${timestamp}.png`;
          const outdoorScreenshotBuffer = await contentArea.screenshot({
            type: 'png'
          });

          screenshots.push({
            filename: outdoorScreenshotFilename,
            buffer: outdoorScreenshotBuffer.toString('base64')
          });

          console.log('✓ Outdoor View screenshot captured successfully');

        } catch (error) {
          console.log('Error taking Outdoor screenshot:', error.message);
          try {
            const outdoorScreenshotFilename = `ookla_OUTDOOR_fullpage_${sanitizedAddress}_${timestamp}.png`;
            const outdoorScreenshotBuffer = await page.screenshot({
              type: 'png',
              clip: { x: 0, y: 50, width: 1280, height: 670 }
            });

            screenshots.push({
              filename: outdoorScreenshotFilename,
              buffer: outdoorScreenshotBuffer.toString('base64')
            });

            console.log('✓ Outdoor View fallback screenshot captured');
          } catch (fallbackError) {
            console.log('Outdoor fallback screenshot failed:', fallbackError.message);
          }
        }
      }

      // Step 16: Select Indoor & Outdoor View and take screenshot if needed
      if (captureIndoorAndOutdoor) {
        console.log('Step 16: Selecting Indoor & Outdoor View...');
        try {
          let indoorOutdoorDropdown = page.locator('div.v-filterselect:has(img[src*="inandoutdoor"])');

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect.map-cb').filter({
              has: page.locator('img[src*="indoor"]')
            });
          }

          if (await indoorOutdoorDropdown.count() === 0) {
            indoorOutdoorDropdown = page.locator('div.v-filterselect-map-cb').first();
          }

          await indoorOutdoorDropdown.waitFor({ state: 'visible', timeout: 10000 });

          const dropdownButton = indoorOutdoorDropdown.locator('div.v-filterselect-button');
          await humanClick(page, dropdownButton);
          console.log('✓ Indoor/Outdoor dropdown clicked');

          await shortWait(page);

          await page.waitForSelector('#VAADIN_COMBOBOX_OPTIONLIST', { state: 'visible', timeout: 5000 });

          // Look for "Outdoor & Indoor" option (this is what Ookla calls it)
          let indoorAndOutdoorOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Outdoor & Indoor")');
          if (await indoorAndOutdoorOption.count() === 0) {
            // Try alternative text formats
            indoorAndOutdoorOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td:has-text("Outdoor &amp; Indoor")');
          }
          if (await indoorAndOutdoorOption.count() === 0) {
            // Try to find by text matching (case insensitive, flexible)
            indoorAndOutdoorOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td').filter({ hasText: /outdoor.*indoor/i });
          }
          if (await indoorAndOutdoorOption.count() === 0) {
            // Last resort: try reverse order
            indoorAndOutdoorOption = page.locator('#VAADIN_COMBOBOX_OPTIONLIST td').filter({ hasText: /indoor.*outdoor/i });
          }

          await indoorAndOutdoorOption.waitFor({ state: 'visible', timeout: 5000 });
          await indoorAndOutdoorOption.click();
          console.log('✓ Outdoor & Indoor View selected');

          await mediumWait(page);

        } catch (error) {
          console.log('Error selecting Indoor & Outdoor View (primary):', error.message);
          try {
            await page.evaluate(() => {
              const dropdowns = document.querySelectorAll('div.v-filterselect');
              for (const dropdown of dropdowns) {
                const img = dropdown.querySelector('img[src*="indoor"]');
                if (img) {
                  const button = dropdown.querySelector('div.v-filterselect-button');
                  if (button) button.click();
                  break;
                }
              }
            });

            await shortWait(page);
            // Try clicking by text match
            const option = await page.locator('#VAADIN_COMBOBOX_OPTIONLIST td').filter({ hasText: /indoor.*outdoor/i }).first();
            if (await option.count() > 0) {
              await option.click({ timeout: 5000 });
              console.log('✓ Indoor & Outdoor View selected (via evaluate method)');
            }
            await mediumWait(page);
          } catch (altError) {
            console.log('Error selecting Indoor & Outdoor View (fallback):', altError.message);
          }
        }

        // Wait for map to update with Indoor & Outdoor View data
        await longWait(page);

        // Step 17: Take Indoor & Outdoor View screenshot
        console.log('Step 17: Taking Indoor & Outdoor View screenshot...');
        try {
          await mediumWait(page);

          const contentArea = page.locator(contentAreaSelector);
          await contentArea.waitFor({ state: 'visible', timeout: 10000 });

          const indoorOutdoorScreenshotFilename = `ookla_OUTDOOR_INDOOR_${sanitizedAddress}_${timestamp}.png`;
          const indoorOutdoorScreenshotBuffer = await contentArea.screenshot({
            type: 'png'
          });

          screenshots.push({
            filename: indoorOutdoorScreenshotFilename,
            buffer: indoorOutdoorScreenshotBuffer.toString('base64')
          });

          console.log('✓ Indoor & Outdoor View screenshot captured successfully');

        } catch (error) {
          console.log('Error taking Indoor & Outdoor screenshot:', error.message);
          try {
            const indoorOutdoorScreenshotFilename = `ookla_OUTDOOR_INDOOR_fullpage_${sanitizedAddress}_${timestamp}.png`;
            const indoorOutdoorScreenshotBuffer = await page.screenshot({
              type: 'png',
              clip: { x: 0, y: 50, width: 1280, height: 670 }
            });

            screenshots.push({
              filename: indoorOutdoorScreenshotFilename,
              buffer: indoorOutdoorScreenshotBuffer.toString('base64')
            });

            console.log('✓ Indoor & Outdoor View fallback screenshot captured');
          } catch (fallbackError) {
            console.log('Indoor & Outdoor fallback screenshot failed:', fallbackError.message);
          }
        }
      }

      console.log('✓ All steps complete!');
      console.log('Waiting briefly before closing...');
      await longWait(page);

      console.log('Closing browser...');
      await browser.close();

      return Response.json({
        success: true,
        screenshots: screenshots
      });

    } else {
      await browser.close();

      return Response.json(
        { success: false, error: 'Login failed' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Automation error:', error);

    if (browser) {
      await browser.close();
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

