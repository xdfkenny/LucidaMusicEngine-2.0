const axios = require('axios');

async function fetchViaFlareSolverr(targetUrl, options = {}) {
  const body = {
    cmd: 'request.get',
    url: targetUrl,
    maxTimeout: options.maxTimeout || 60000
  };

  const res = await axios.post(options.flaresolverrUrl || 'http://localhost:8191/v1', body, {
    timeout: (options.maxTimeout || 60000) + 5000,
    headers: { 'Content-Type': 'application/json' }
  });

  return res.data; // FlareSolverr returns { status, solution, ... }
}

module.exports = { fetchViaFlareSolverr };
