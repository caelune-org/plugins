const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/';

/** Uniform rejection sampling — avoids modulo bias. */
const pick = (charset, n) => {
  const limit = Math.floor(256 / charset.length) * charset.length;
  const out = [];
  while (out.length < n) {
    const buf = new Uint8Array(n - out.length + 8);
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < limit) out.push(charset[b % charset.length]);
      if (out.length === n) break;
    }
  }
  return out.join('');
};

const entropy = (len, charset) => Math.round(len * Math.log2(charset));

caelune.tool('make_password', (input) => {
  const length = Math.min(64, Math.max(6, Math.round(Number(input.length)) || 16));
  const symbols = input.symbols !== false;
  const charset = ALPHA + DIGITS + (symbols ? SYMBOLS : '');
  const password = pick(charset, length);
  return {
    content:
      'Generated a ' + length + '-character password (' +
      entropy(length, charset.length) + ' bits of entropy' +
      (symbols ? '' : ', letters and digits only') +
      ') — it is shown in the card, not repeated here.',
    render: {
      component: 'pass-card',
      props: { password, length, symbols },
    },
  };
});
