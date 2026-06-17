module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  await require('./clickAndHoverHelper.cjs')(page, scenario);

  // Add basic auth or session setup here if needed
  // await page.evaluate(() => {
  //   localStorage.setItem('auth-token', 'test-token');
  // });
};