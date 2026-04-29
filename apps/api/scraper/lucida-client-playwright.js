const { chromium } = require('playwright');

async function fetchWithPlaywright(url, opts = {}) {
  const browser = await chromium.launch({ headless: opts.headless !== false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: opts.timeout || 30000 });
  const html = await page.content();
  const cookies = await context.cookies();
  await browser.close();
  return { html, cookies };
}

module.exports = { fetchWithPlaywright };
