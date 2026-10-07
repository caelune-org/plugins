caelune.tool('make_qr', (input) => {
  const text = String(input.text ?? '').trim();
  if (!text) return { content: 'text is required' };
  if (text.length > 500) return { content: 'text is too long — keep it under 500 characters' };
  const size = Math.min(512, Math.max(128, Math.round(Number(input.size)) || 256));
  return {
    content:
      'QR code (' + size + '×' + size + ') for "' +
      (text.length > 60 ? text.slice(0, 57) + '…' : text) +
      '" — rendered in the card, ready to scan.',
    render: { component: 'qr-card', props: { text, size } },
  };
});
