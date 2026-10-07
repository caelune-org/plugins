const API = 'https://api.frankfurter.dev/v1/latest';
const CODE_RE = /^[A-Za-z]{3}$/;

caelune.tool('convert_currency', async (input) => {
  const amount = Number(input.amount);
  if (!isFinite(amount) || amount < 0) return { content: 'amount must be a non-negative number' };
  const from = String(input.from ?? '').trim().toUpperCase();
  const to = String(input.to ?? '').trim().toUpperCase();
  if (!CODE_RE.test(from) || !CODE_RE.test(to))
    return { content: 'from/to must be 3-letter ISO 4217 codes like USD, EUR, JPY' };

  if (from === to) {
    return {
      content: amount.toFixed(2) + ' ' + from + ' = ' + amount.toFixed(2) + ' ' + to,
      render: { component: 'fx-card', props: { amount, from, to, result: amount, rate: 1, date: 'same currency' } },
    };
  }

  const data = await caelune
    .fetch(API + '?base=' + from + '&symbols=' + to)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const rate = data?.rates?.[to];
  if (rate === undefined) {
    return {
      content:
        'No rate for ' + from + '→' + to +
        ' — check both are ISO 4217 codes supported by the ECB reference set',
    };
  }
  const result = Math.round(amount * rate * 100) / 100;
  return {
    content:
      amount + ' ' + from + ' = ' + result.toFixed(2) + ' ' + to +
      ' — rate ' + rate + ' (' + (data.date ?? 'latest') + ')',
    render: {
      component: 'fx-card',
      props: { amount, from, to, result, rate, date: data.date ?? '' },
    },
  };
});
