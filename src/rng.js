// Mulberry32 seeded PRNG - deterministic, fast, good distribution
// Based on https://github.com/bryc/code/blob/master/jshash/PRNGs.md

export function makeRng(seed) {
  let a = seed;

  function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(n) {
      if (n <= 0) throw new Error('int(n) requires n > 0');
      return Math.floor(next() * n);
    },
    pick(array) {
      if (!Array.isArray(array) || array.length === 0) {
        throw new Error('pick requires non-empty array');
      }
      return array[this.int(array.length)];
    },
    shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.int(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    chance(p) {
      if (p < 0 || p > 1) throw new Error('chance(p) requires 0 <= p <= 1');
      return next() < p;
    }
  };
}
