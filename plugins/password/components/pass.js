caelune.component('pass-card', ({ ui, props }) => {
  const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/';

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

  const strength = (len, syms) => {
    const bits = len * Math.log2((syms ? SYMBOLS.length : 0) + ALPHA.length + DIGITS.length);
    if (bits >= 90) return ['strong', 'strong · ' + Math.round(bits) + ' bits'];
    if (bits >= 60) return ['ok', 'good · ' + Math.round(bits) + ' bits'];
    return ['weak', 'weak · ' + Math.round(bits) + ' bits'];
  };

  const paint = (password, length, symbols) => {
    const [cls, label] = strength(length, symbols);
    ui.text('.pw-value', password);
    ui.attr('.pw-strength', 'class', 'pw-strength ' + cls);
    ui.text('.pw-strength', label);
  };

  paint(
    String(props.password ?? ''),
    Number(props.length) || 16,
    props.symbols !== false,
  );

  ui.on('regen', () => {
    const length = Math.min(64, Math.max(6, Number(props.length) || 16));
    const symbols = props.symbols !== false;
    const charset = ALPHA + DIGITS + (symbols ? SYMBOLS : '');
    paint(pick(charset, length), length, symbols);
  });
});
