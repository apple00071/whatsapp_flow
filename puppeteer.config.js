module.exports = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-notifications',
    '--window-size=1280,720',
    '--window-position=0,0',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-features=site-per-process',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials'
  ],
  defaultViewport: {
    width: 1280,
    height: 720
  },
  ignoreHTTPSErrors: true,
  timeout: 0,
  pipe: true
}; 