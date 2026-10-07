caelune.component('ws-card', async ({ ui, props }) => {
  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  /* Inline lucide glyphs — plugin workers can't import the library. */
  const ic = (body, s) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  const FILE = ic(
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>' +
    '<path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    13,
  );
  const FOLDER = ic(
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9' +
    'A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    13,
  );
  const fmt = (n) =>
    n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';

  let ws = typeof props.ws === 'string' ? props.ws : '';
  const select = typeof props.select === 'string' ? props.select : '';
  let files = [];
  let wss = [];
  let preview = null;

  const refresh = async () => {
    if (ws) {
      try {
        files = await caelune.files.list(ws);
      } catch {
        ws = '';
        files = [];
      }
    }
    if (!ws) wss = await caelune.files.workspaces();
  };

  const render = () => {
    if (ws) {
      const bytes = files.reduce((n, f) => n + f.size, 0);
      ui.text('.ws-title', ws);
      ui.text(
        '.ws-meta',
        files.length + ' file' + (files.length === 1 ? '' : 's') + ' · ' + fmt(bytes),
      );
      const rows = files
        .map(
          (f) =>
            '<div class="ws-row' + (f.path === select ? ' sel' : '') +
            '" data-emit="open" data-value="' + esc(f.path) + '">' +
            '<span class="ws-ic">' + FILE + '</span>' +
            '<span class="ws-path">' + esc(f.path) + '</span>' +
            '<span class="ws-size">' + fmt(f.size) + '</span></div>',
        )
        .join('');
      let html =
        '<div class="ws-list">' + (rows || '<div class="ws-empty">Empty workspace</div>') + '</div>';
      if (preview) {
        html +=
          '<div class="ws-prev"><div class="ws-prev-head"><span class="ws-prev-path">' +
          esc(preview.path) + '</span><button class="ws-prev-x" data-emit="close">×</button></div>' +
          '<pre class="ws-pre">' + esc(preview.text) + '</pre></div>';
      }
      ui.html('.ws-body', html);
      return;
    }
    ui.text('.ws-title', 'Workspaces');
    ui.text('.ws-meta', wss.length + ' total');
    ui.html(
      '.ws-body',
      '<div class="ws-list">' +
        (wss.length
          ? wss
              .map(
                (w) =>
                  '<div class="ws-row" data-emit="open-ws" data-value="' + esc(w) + '">' +
                  '<span class="ws-ic">' + FOLDER + '</span><span class="ws-path">' + esc(w) +
                  '</span></div>',
              )
              .join('')
          : '<div class="ws-empty">No workspaces yet</div>') +
        '</div>',
    );
  };

  ui.on('open', async (p) => {
    try {
      const r = await caelune.files.read(ws, String(p), { length: 900 });
      preview = { path: String(p), text: r.content + (r.hasMore ? '\n…' : '') };
      render();
    } catch {
      /* file vanished — the next refresh drops the row */
    }
  });
  ui.on('close', () => {
    preview = null;
    render();
  });
  ui.on('open-ws', async (w) => {
    ws = String(w);
    preview = null;
    await refresh();
    render();
  });

  await refresh();
  render();

  // Pick up writes other tool calls make while this card lives.
  const poll = setInterval(async () => {
    await refresh();
    render();
  }, 4000);
  ui.on('unmount', () => clearInterval(poll));
});
