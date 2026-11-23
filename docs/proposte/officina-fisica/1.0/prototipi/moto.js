// Unità SI. Il cammino ha due tratti uniformi e un'inversione idealizzata a 4 s.
const moto = (() => {
  const andata = 4, v1 = 3, v2 = -2;
  function osserva(ritorno, istante = andata + ritorno) {
    if (!Number.isInteger(ritorno) || ritorno < 0 || ritorno > 8) throw RangeError('Durata fuori scala');
    const totale = andata + ritorno;
    const t = Math.min(totale, Math.max(0, istante));
    const prima = v1 * Math.min(t, andata);
    const seconda = v2 * Math.max(0, t - andata);
    return {ritorno, totale, t, prima, seconda, x: prima + seconda, distanza: prima - seconda};
  }
  function numero(raw) {
    const value = String(raw).trim().replace('−','-').replace(',','.');
    return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : NaN;
  }
  function firma(n) {return n < 0 ? '−' + Math.abs(n) : n > 0 ? '+' + n : '0'}
  return {andata, v1, v2, osserva, numero, firma};
})();
