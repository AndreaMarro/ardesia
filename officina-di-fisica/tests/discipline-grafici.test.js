import assert from 'node:assert/strict';
import test from 'node:test';
import { polynomialLab } from '../multidiscipline/static/js/discipline-grafici.js';

test('La secante e la tangente in un punto negativo hanno pendenze distinte', () => {
  const spec = {kind:'secant', coefficients:[1,-2,0,1], point:-1};
  const secant = polynomialLab(spec, 7); // h = 1/2
  assert.deepEqual([secant.fa, secant.fb, secant.slope], [2, 15/8, -1/4]);
  const tangent = polynomialLab(spec, 4); // h = 0
  assert.equal(tangent.slope, 1); // f'(x) = 3x² − 2
  assert.equal(tangent.line(-1), 2);
});

test('Somma sinistra e integrale conservano le aree negative', () => {
  const result = polynomialLab({kind:'riemann', coefficients:[-1,1], interval:[-1,1]}, 4);
  assert.deepEqual(result.rectangles.map(r => r.area), [-1,-3/4,-1/2,-1/4]);
  assert.equal(result.sum, -5/2);
  assert.equal(result.integral, -2); // [x²/2 − x] da −1 a 1
});

test('L’intervallo, il parametro e i coefficienti devono appartenere ai domini supportati', () => {
  const spec = {kind:'riemann', coefficients:[0,1], interval:[0,1]};
  for (const n of [0, 1.5, 13, NaN]) assert.equal(polynomialLab(spec,n), undefined);
  assert.equal(polynomialLab({...spec, interval:[1,1]}, 4), undefined);
  assert.equal(polynomialLab({...spec, coefficients:[Infinity]}, 4), undefined);
  assert.equal(polynomialLab({...spec, kind:'sconosciuto'}, 4), undefined);
});
