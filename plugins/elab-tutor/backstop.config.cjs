// BackstopJS Visual Regression — ELAB Tutor
// 3 viewport: mobile (iPhone 14), tablet (iPad/LIM 1024x768), desktop
// Hash-based routing: URLs use #page (NOT /page)
// Usage: npx backstopjs reference --config=backstop.config.cjs
//        npx backstopjs test --config=backstop.config.cjs

const BASE_URL = process.env.BACKSTOP_BASE_URL || 'http://localhost:4173';

module.exports = {
  "id": "elab-tutor-visual-regression",
  "viewports": [
    { "label": "mobile",  "width": 375,  "height": 812 },
    { "label": "tablet",  "width": 1024, "height": 768 },
    { "label": "desktop", "width": 1280, "height": 800 }
  ],
  "onBeforeScript": "puppet/onBefore.cjs",
  "onReadyScript": "puppet/onReady.cjs",
  "scenarios": [
    {
      "label": "Vetrina-Homepage",
      "url": `${BASE_URL}/`,
      "delay": 3000,
      "selectors": ["document"],
      "misMatchThreshold": 0.5,
      "requireSameDimensions": true
    },
    {
      "label": "Login-Page",
      "url": `${BASE_URL}/#login`,
      "delay": 2000,
      "selectors": ["document"],
      "misMatchThreshold": 0.5,
      "requireSameDimensions": true
    }
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "report": ["browser", "CI"],
  "engine": "puppeteer",
  "engineOptions": {
    "args": ["--no-sandbox"]
  },
  "asyncCaptureLimit": 3,
  "asyncCompareLimit": 50,
  "debug": false,
  "debugWindow": false
}
