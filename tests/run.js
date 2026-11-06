/* Run with: node tests/run.js  (chord detection on synthetic audio: known chords in, chords and key out) */
const assert = require('assert');
const { analyze } = require('../chords.js');
let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; } catch (e) { fail++; console.log('FAIL', name, '-', e.message); } }

const SR = 22050;
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (pc, octave) => 440 * Math.pow(2, (pc - 9) / 12 + (octave - 4));
const triad = name => {
  const m = /^([A-G]#?)(m?)$/.exec(name), root = NOTE[m[1]];
  return [root, root + (m[2] ? 3 : 4), root + 7];
};
/* Chords as a few harmonics per note, each chord held for `secs` seconds. */
function render(chords, secs = 3) {
  const x = new Float32Array(Math.round(SR * secs * chords.length));
  chords.forEach((name, k) => {
    const pcs = triad(name), start = Math.round(SR * secs * k), len = Math.round(SR * secs);
    for (const pc of pcs) for (const [octave, amp] of [[3, 0.6], [4, 1], [5, 0.4]]) {
      const f = freq(pc, octave), w = 2 * Math.PI * f / SR;
      for (let i = 0; i < len; i++) x[start + i] += amp * Math.sin(w * i);
    }
  });
  return x;
}
const chordsOf = r => r.segments.map(s => s.chord);

for (const name of ['C', 'G', 'Am', 'F#m', 'D#']) {
  t(`single chord ${name} is found`, () => assert.deepStrictEqual([...new Set(chordsOf(analyze(render([name]), SR)))], [name]));
}
t('C G Am F progression in order', () => {
  const found = chordsOf(analyze(render(['C', 'G', 'Am', 'F']), SR));
  assert.deepStrictEqual(found.filter((c, i) => c !== found[i - 1]), ['C', 'G', 'Am', 'F']);
});
t('segments run forward in time', () => {
  const s = analyze(render(['C', 'G', 'Am', 'F']), SR).segments;
  s.forEach((x, i) => { assert.ok(x.end > x.start); if (i) assert.ok(x.start >= s[i - 1].start); });
});
t('key of C G Am F is C', () => assert.strictEqual(analyze(render(['C', 'G', 'Am', 'F', 'C']), SR).key, 'C'));
t('A E F#m D suggests capo 2 with open shapes G D Em C', () => {
  const r = analyze(render(['A', 'E', 'F#m', 'D']), SR);
  assert.strictEqual(r.capo.capo, 2);
  assert.deepStrictEqual(r.capo.chords.slice().sort(), ['C', 'D', 'Em', 'G']);
});
t('silence gives no chords', () => assert.strictEqual(analyze(new Float32Array(SR * 3), SR).segments.length, 0));

console.log(`${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
