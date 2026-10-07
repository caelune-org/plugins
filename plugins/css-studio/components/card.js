caelune.component('css-card', ({ ui, props }) => {
  const css = String(props.css ?? '').trim();
  if (!css) {
    ui.text('.css-state', 'cleared');
    ui.attr('.css-dot', 'style', 'background:#a09888');
    ui.text('.css-body', '/* custom styling removed */');
    return;
  }
  const rules = css.split('}').filter((r) => r.trim() && r.includes('{')).length;
  ui.text('.css-state', rules + ' rule' + (rules === 1 ? '' : 's') + ' active');
  const lines = css.split('\n');
  ui.text('.css-body', lines.slice(0, 10).join('\n') + (lines.length > 10 ? '\n…' : ''));
});
