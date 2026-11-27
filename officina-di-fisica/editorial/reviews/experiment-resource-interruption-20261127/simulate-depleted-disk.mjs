import fs from 'node:fs/promises';

const statfs = fs.statfs;
let observations = 0;
fs.statfs = async (...args) => {
  const observed = await statfs(...args);
  observations += 1;
  // Preserve the real initial guard. The second check simulates exhaustion after 25 writes.
  return observations === 2 ? {...observed, bavail: 0} : observed;
};
