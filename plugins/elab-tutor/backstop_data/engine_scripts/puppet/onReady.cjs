module.exports = async (page, scenario, vp) => {
  console.log('READY > ' + scenario.label);
  
  // Hide dynamic elements that change between runs
  await page.addStyleTag({
    content: `
      /* Hide timestamps, dynamic counters, animations */
      .loading-animation,
      .timestamp,
      .cursor-blink,
      .typing-indicator {
        visibility: hidden !important;
      }
      
      /* Stop CSS animations and transitions */
      *, *:before, *:after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });

  // Wait for any lazy-loaded content
  await page.waitForFunction(() => {
    return document.readyState === 'complete';
  });
};