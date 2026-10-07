caelune.component('qr-card', ({ ui, props }) => {
  const text = String(props.text ?? '');
  const size = Math.min(512, Math.max(128, Math.round(Number(props.size)) || 256));
  const url =
    'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
    '&margin=8&data=' + encodeURIComponent(text);
  ui.attr('.qr-img', 'src', url);
  ui.text('.qr-text', text);
  ui.text('.qr-size', size + '×' + size + ' px · rendered by api.qrserver.com');
});
