caelune.component('fx-card', ({ ui, props }) => {
  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  ui.text('.fx-from', fmt(props.amount ?? 0) + ' ' + String(props.from ?? ''));
  ui.text('.fx-to', fmt(props.result ?? 0) + ' ' + String(props.to ?? ''));
  ui.text(
    '.fx-rate',
    '1 ' + String(props.from ?? '') + ' = ' + String(props.rate ?? '—') +
      ' ' + String(props.to ?? '') + (props.date ? ' · ' + props.date : ''),
  );
});
