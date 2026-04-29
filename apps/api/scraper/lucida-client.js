const { fetchLucidaQuick } = require('./lucida-client-quick');
const { fetchViaFlareSolverr } = require('./lucida-client-flaresolverr');
const { fetchWithPlaywright } = require('./lucida-client-playwright');

async function fetchLucida(url, opts = {}) {
  // 1) Quick attempt with browser-like headers
  try {
    const quick = await fetchLucidaQuick(url);
    const body = quick && quick.data ? quick.data : (quick && quick.html) || '';
    if (quick && quick.status && quick.status < 400 && !/Just a moment|cf-mitigated/i.test(body)) {
      return { method: 'quick', status: quick.status, body, headers: quick.headers };
    }
  } catch (err) {
    // continue to next
  }

  // 2) Try FlareSolverr if available
  try {
    const fsr = await fetchViaFlareSolverr(url, { flaresolverrUrl: opts.flaresolverrUrl, maxTimeout: opts.maxTimeout });
    if (fsr && fsr.status === 'ok' && fsr.solution && fsr.solution.response) {
      const html = fsr.solution.response;
      return { method: 'flaresolverr', status: 200, body: html, solution: fsr.solution };
    }
  } catch (err) {
    // continue to next
  }

  // 3) Fallback: Playwright
  try {
    const pw = await fetchWithPlaywright(url, { headless: opts.headless, timeout: opts.timeout });
    if (pw && pw.html) {
      return { method: 'playwright', status: 200, body: pw.html, cookies: pw.cookies };
    }
  } catch (err) {
    // all failed
    throw new Error('All fetch methods failed');
  }
}

module.exports = { fetchLucida };
