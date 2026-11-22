// @ts-check
/** @type {import('../../../../contracts/engine.js').Measure} */
export const measure = (base) => 3 * base;

/** @type {import('../../../../contracts/engine.js').Draw} */
export function draw(board, {x}) {
  const scale = 0.42, left = -1.8;
  board.box([left + x * scale / 2, .38, 0], [x * scale, .12, 3 * scale], 0x147979);
  for (let i = 0; i <= x; i++) {
    board.line([[left + i * scale, .45, -.63], [left + i * scale, .45, .63]], 0xffedc5);
  }
  for (let i = 0; i <= 3; i++) {
    const z = -.63 + i * scale;
    board.line([[left, .45, z], [left + x * scale, .45, z]], 0xffedc5);
  }
  board.label([left + x * scale / 2, .95, .8], 'Base ' + x + ' cm');
  board.label([left - .5, .9, 0], '3 cm');
}
