/**
 * Checks if the script is executing in a Node environment (e.g. desktop as
 * opposed to browser)
 */
export const isNode = () => (
  typeof process !== 'undefined' && process.release.name === 'node'
);
