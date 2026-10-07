const countRules = (css) =>
  css.split('}').filter((r) => r.trim() && r.includes('{')).length;

caelune.tool('get_custom_css', async () => {
  const css = await caelune.settings.get('customCss');
  return {
    content: css
      ? 'Current custom CSS (' + css.length + ' chars):\n```css\n' + css + '\n```'
      : 'No custom CSS is currently applied',
  };
});

caelune.tool('set_custom_css', async (input) => {
  const css = String(input.css ?? '');
  if (css.length > 50000) {
    return { content: 'Stylesheet is too long — keep it under 50KB' };
  }
  await caelune.settings.set('customCss', css);
  const n = countRules(css);
  return {
    content: css
      ? 'Applied custom CSS — ' + n + ' rule block' + (n === 1 ? '' : 's') + ' now live'
      : 'Cleared all custom CSS',
    render: { component: 'css-card', props: { css } },
  };
});
