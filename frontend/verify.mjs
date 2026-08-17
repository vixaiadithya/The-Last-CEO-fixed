import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  context.setDefaultTimeout(120000);
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  console.log("Navigating to http://localhost:5173/enter");
  await page.goto('http://localhost:5173/enter');

  console.log("Setting up game state...");
  await page.waitForFunction('window.runAutoPlayValidation !== undefined', { timeout: 10000 });
  
  await page.evaluate(async () => {
    await window.runAutoPlayValidation();
  });

  console.log("Waiting for Engine...");
  await page.waitForURL('http://localhost:5173/engine', { timeout: 10000 });
  await page.waitForFunction('window.__runAutoPlayValidation !== undefined', { timeout: 10000 });

  console.log("Running Auto Play Loop...");
  await page.evaluate(() => {
    // start loop asynchronously in browser
    window.__runAutoPlayValidation();
  });

  console.log("Waiting for completion...");
  await page.waitForFunction('window.__TEST_RESULTS__ !== undefined', { timeout: 300000 });

  console.log("Extracting results...");
  const results = await page.evaluate(() => {
    return window.__TEST_RESULTS__;
  });

  fs.writeFileSync('simulation_results.json', JSON.stringify(results, null, 2));
  console.log("Done!");
  
  await browser.close();
})();
