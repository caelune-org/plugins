const fmt = (n) =>
  n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';

const card = (ws, select) => ({ component: 'ws-card', props: { ws, select } });
const overview = () => ({ component: 'ws-card', props: {} });

/* The worker is a per-plugin singleton — remembering the last workspace
 * lets the model omit `ws` once one is in play. */
let lastWs = '';
const wsOf = (input) => {
  const ws = String(input.ws ?? '').trim() || lastWs;
  if (!ws) throw new Error('no workspace in play — pass ws explicitly');
  lastWs = ws;
  return ws;
};
const arg = (input, k) => String(input[k] ?? '').trim();

/* Guard rejections come back as clean content so the model self-corrects. */
const attempt = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    return { content: 'Rejected: ' + (e && e.message ? e.message : String(e)) };
  }
};

const wsStats = async (ws) => {
  const files = await caelune.files.list(ws);
  const bytes = files.reduce((n, f) => n + f.size, 0);
  return { count: files.length, bytes };
};

caelune.tool('workspace_list', async () =>
  attempt(async () => {
    const names = await caelune.files.workspaces();
    if (!names.length) {
      return {
        content:
          'No workspaces yet — file_write auto-creates one, or use workspace_create explicitly.',
      };
    }
    const lines = [];
    for (const ws of names) {
      const s = await wsStats(ws);
      lines.push(ws + ' — ' + s.count + ' file' + (s.count === 1 ? '' : 's') + ', ' + fmt(s.bytes));
    }
    return {
      content: names.length + ' workspace' + (names.length === 1 ? '' : 's') + ':\n' + lines.join('\n'),
      render: overview(),
    };
  }),
);

caelune.tool('workspace_create', async (input) =>
  attempt(async () => {
    await caelune.files.createWs(arg(input, 'name'));
    const name = arg(input, 'name');
    lastWs = name;
    return { content: 'Created workspace "' + name + '"', render: card(name) };
  }),
);

caelune.tool('workspace_delete', async (input) =>
  attempt(async () => {
    const name = arg(input, 'name');
    const s = await wsStats(name);
    await caelune.files.removeWs(name);
    if (lastWs === name) lastWs = '';
    return {
      content: 'Deleted workspace "' + name + '" (' + s.count + ' files removed)',
      render: overview(),
    };
  }),
);

caelune.tool('workspace_rename', async (input) =>
  attempt(async () => {
    const from = arg(input, 'from');
    const to = arg(input, 'to');
    await caelune.files.renameWs(from, to);
    if (lastWs === from) lastWs = to;
    return { content: 'Renamed workspace "' + from + '" → "' + to + '"', render: card(to) };
  }),
);

caelune.tool('file_list', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const files = await caelune.files.list(ws, arg(input, 'prefix') || undefined);
    const bytes = files.reduce((n, f) => n + f.size, 0);
    const body = files.length
      ? files
          .slice(0, 120)
          .map((f) => f.path + '  ' + fmt(f.size))
          .join('\n')
      : '(empty)';
    return {
      content:
        ws + ': ' + files.length + ' file' + (files.length === 1 ? '' : 's') +
        ', ' + fmt(bytes) + '\n' + body + (files.length > 120 ? '\n…' : ''),
      render: card(ws),
    };
  }),
);

caelune.tool('file_read', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const path = arg(input, 'path');
    const lineMode = input.line !== undefined && input.line !== null && input.line !== '';
    const r = lineMode
      ? await caelune.files.read(ws, path, {
          line: Number(input.line) || 1,
          count: Number(input.count) || undefined,
        })
      : await caelune.files.read(ws, path, {
          offset: Number(input.offset) || 0,
          length: Number(input.length) || undefined,
        });
    const where = lineMode
      ? 'lines ' + (r.offset + 1) + '-' + (r.offset + r.content.split('\n').length) +
        ' of ' + (r.totalLines ?? '?')
      : r.content.length + ' of ' + r.size + ' chars' + (r.offset ? ' from offset ' + r.offset : '');
    const more = r.hasMore
      ? lineMode
        ? ' (more: continue with line=' + (r.offset + r.content.split('\n').length + 1) + ')'
        : ' (more: continue with offset=' + (r.offset + r.content.length) + ')'
      : '';
    return {
      content: ws + '/' + r.path + ' — ' + where + more + '\n\n' + r.content,
      render: card(ws, r.path),
    };
  }),
);

caelune.tool('file_write', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const path = arg(input, 'path');
    const append = input.append === true;
    const r = await caelune.files.write(ws, path, String(input.content ?? ''), { append });
    return {
      content:
        (append ? 'Appended ' : 'Wrote ') + fmt(r.bytes) + ' to ' + ws + '/' + r.path +
        ' (now ' + fmt(r.size) + ')',
      render: card(ws, r.path),
    };
  }),
);

caelune.tool('file_edit', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const path = arg(input, 'path');
    const r = await caelune.files.edit(ws, path, {
      old: String(input.old ?? ''),
      new: String(input.new ?? ''),
      all: input.all === true,
    });
    return {
      content:
        'Replaced ' + r.replaced + ' spot' + (r.replaced === 1 ? '' : 's') + ' in ' +
        ws + '/' + r.path + ' (now ' + fmt(r.size) + ')',
      render: card(ws, r.path),
    };
  }),
);

caelune.tool('file_search', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const r = await caelune.files.search(ws, {
      query: arg(input, 'query'),
      prefix: arg(input, 'prefix') || undefined,
      ci: input.ci === true,
      max: Number(input.max) || undefined,
    });
    const body = r.matches.length
      ? r.matches.map((m) => m.path + ':' + m.line + ': ' + m.text).join('\n')
      : '(no matches)';
    return {
      content:
        r.matches.length + ' hit' + (r.matches.length === 1 ? '' : 's') + ' for "' + r.query +
        '" in ' + ws + (r.truncated ? ' (truncated)' : '') + ':\n' + body,
      render: card(ws, r.matches[0]?.path),
    };
  }),
);

caelune.tool('file_delete', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const path = arg(input, 'path');
    const st = await caelune.files.stat(ws, path);
    await caelune.files.remove(ws, path);
    return {
      content: 'Deleted ' + ws + '/' + path + (st ? ' (freed ' + fmt(st.size) + ')' : ''),
      render: card(ws),
    };
  }),
);

caelune.tool('file_move', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const from = arg(input, 'from');
    const to = arg(input, 'to');
    await caelune.files.move(ws, from, to);
    return { content: 'Moved ' + ws + '/' + from + ' → ' + to, render: card(ws, to) };
  }),
);

caelune.tool('file_download', async (input) =>
  attempt(async () => {
    const ws = wsOf(input);
    const path = arg(input, 'path');
    const st = await caelune.files.stat(ws, path);
    await caelune.files.download(ws, path);
    return {
      content:
        'Sent ' + ws + '/' + path + (st ? ' (' + fmt(st.size) + ')' : '') +
        ' to the downloads folder as "' + ws + '--' + path.replaceAll('/', '--') + '"',
      render: card(ws, path),
    };
  }),
);
