const fmt = (n) =>
  n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';

const card = (ws, select) => ({ component: 'ws-card', props: { ws, select } });
const overview = () => ({ component: 'ws-card', props: {} });
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
    return { content: 'Created workspace "' + name + '"', render: card(name) };
  }),
);

caelune.tool('workspace_delete', async (input) =>
  attempt(async () => {
    const name = arg(input, 'name');
    const s = await wsStats(name);
    await caelune.files.removeWs(name);
    return {
      content: 'Deleted workspace "' + name + '" (' + s.count + ' files removed)',
      render: overview(),
    };
  }),
);

caelune.tool('file_list', async (input) =>
  attempt(async () => {
    const ws = arg(input, 'ws');
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
    const ws = arg(input, 'ws');
    const path = arg(input, 'path');
    const r = await caelune.files.read(ws, path, {
      offset: Number(input.offset) || 0,
      length: Number(input.length) || undefined,
    });
    return {
      content:
        ws + '/' + r.path + ' — showing ' + r.content.length + ' of ' + r.size + ' chars' +
        (r.offset ? ' from offset ' + r.offset : '') +
        (r.hasMore ? ' (more: call again with offset=' + (r.offset + r.content.length) + ')' : '') +
        '\n\n' + r.content,
      render: card(ws, r.path),
    };
  }),
);

caelune.tool('file_write', async (input) =>
  attempt(async () => {
    const ws = arg(input, 'ws');
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

caelune.tool('file_delete', async (input) =>
  attempt(async () => {
    const ws = arg(input, 'ws');
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
    const ws = arg(input, 'ws');
    const from = arg(input, 'from');
    const to = arg(input, 'to');
    await caelune.files.move(ws, from, to);
    return { content: 'Moved ' + ws + '/' + from + ' → ' + to, render: card(ws, to) };
  }),
);
