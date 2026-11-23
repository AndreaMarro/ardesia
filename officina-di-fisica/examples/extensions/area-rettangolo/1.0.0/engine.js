// @ts-check
/** @type {import('../../../../contracts/engine.js').Measure} */
export const measure = (base) => 3 * base;

/** @type {import('../../../../contracts/engine.js').Draw} */
export function draw(board, {x}) {
  const unit = .70, bottom = .29, left = -x * unit / 2;
  const height = 3 * unit, width = x * unit;
  board.box([0, bottom + height / 2, 0], [width, height, .14], 0x21665c);
  for (let column = 0; column < x; column++) {
    for (let row = 0; row < 3; row++) {
      const atX = left + (column + .5) * unit;
      const atY = bottom + (row + .5) * unit;
      const ink = (column + row) % 2 ? 0x96d6bf : 0x46a992;
      board.box([atX, atY, .085], [unit - .032, unit - .032, .04], ink);
    }
  }
  board.label([0, bottom + height + .3, .13], 'Base ' + x + ' cm');
  board.label([left - .30, bottom + height / 2, .14], '3 cm');
}
