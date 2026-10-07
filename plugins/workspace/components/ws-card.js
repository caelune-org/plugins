caelune.component('ws-card', ({ ui, props }) => {
  const esc = (s) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const fmt = (n) =>
    n >= 1048576
      ? (n / 1048576).toFixed(1) + ' MB'
      : n >= 1024
        ? (n / 1024).toFixed(1) + ' KB'
        : n + ' B';
  const EXT = {
    md: 'file-text', txt: 'file-text', js: 'braces', ts: 'braces', mjs: 'braces',
    json: 'braces', css: 'braces', html: 'code', svg: 'code', py: 'braces',
    rs: 'braces', go: 'braces', java: 'braces', sh: 'terminal',
  };
  const EXT_ICON = {
    'file-text':
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    braces:
      '<path d="m8 3-4 8 4 8"/><path d="m16 3 4 8-4 8"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    folder:
      '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    download:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pen: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  };
  const ic = (n) =>
    '<svg class="ws-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    EXT_ICON[n] +
    '</svg>';
  const fileIc = (p) => {
    const segs = p.split('/');
    const name = segs[segs.length - 1];
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    return ic(EXT[ext] || 'file-text');
  };

  const EDIT_MAX = 48_000; // inline editing only for files we can fetch whole
  let ws = props.ws || '';
  let files = [];
  let workspaces = [];
  let preview = null; // {path, text, size}
  let editing = null; // {path, text}
  let err = '';
  let lastJson = '';
  let status = '';

  const loadWorkspaces = async () => {
    workspaces = await caelune.files.workspaces();
  };
  const loadFiles = async () => {
    files = ws ? await caelune.files.list(ws) : [];
  };
  /* While editing, the textarea is user-owned DOM (the bridge can't read it
   * back) — render() must never clobber it; the edit/cancel/save handlers
   * drive the transitions themselves. */
  const render = () => {
    if (editing) return;
    const json = JSON.stringify([ws, files, workspaces, preview, err, status]);
    if (json !== lastJson) {
      lastJson = json;
      ui.html('.ws-body', html());
    }
  };
  const refresh = async () => {
    try {
      await loadWorkspaces();
      if (ws && !workspaces.includes(ws)) {
        ws = '';
        preview = editing = null;
      }
      await loadFiles();
      err = '';
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
    render();
  };

  const wsRow = (n) =>
    '<div class="ws-row ws-ws" data-emit="pick" data-value="' + esc(n) + '">' +
    '<span class="ws-icw">' + ic('folder') + '</span><span class="ws-p">' + esc(n) + '</span>' +
    '<span class="ws-sz"></span></div>';

  const fileRow = (f) =>
    '<div class="ws-row' + (preview && preview.path === f.path ? ' ws-sel' : '') + '" data-emit="pick" data-value="' + esc(f.path) + '">' +
    '<span class="ws-icw">' + fileIc(f.path) + '</span>' +
    '<span class="ws-p">' + esc(f.path) + '</span>' +
    '<span class="ws-sz">' + fmt(f.size) + '</span>' +
    '<span class="ws-acts">' +
    '<button class="ws-btn" data-emit="dl" data-value="' + esc(f.path) + '" title="Download">' + ic('download') + '</button>' +
    '<button class="ws-btn ws-danger" data-emit="del" data-value="' + esc(f.path) + '" title="Delete">' + ic('x') + '</button>' +
    '</span></div>';

  const previewHtml = () => {
    if (editing) {
      return (
        '<div class="ws-prev"><div class="ws-prevh"><span class="ws-pt">' + esc(editing.path) + '</span>' +
        '<button class="ws-btn" data-emit="cancel-edit" title="Cancel">' + ic('x') + '</button></div>' +
        '<form class="ws-editf" data-emit="save">' +
        '<input type="hidden" name="path" value="' + esc(editing.path) + '">' +
        '<textarea name="content" class="ws-ta" spellcheck="false">' + esc(editing.text) + '</textarea>' +
        '<button type="submit" class="ws-save"><span class="ws-icw">' + ic('save') + '</span>Save</button>' +
        '</form></div>'
      );
    }
    if (preview) {
      const canEdit = preview.size <= EDIT_MAX;
      return (
        '<div class="ws-prev"><div class="ws-prevh"><span class="ws-pt">' + esc(preview.path) + '</span>' +
        (canEdit
          ? '<button class="ws-btn" data-emit="edit" data-value="' + esc(preview.path) + '" title="Edit">' + ic('pen') + '</button>'
          : '') +
        '</div><pre class="ws-pre">' + esc(preview.text) + '</pre></div>'
      );
    }
    return '';
  };

  const html = () => {
    if (!ws) {
      // Overview — workspace list + create form.
      return (
        '<div class="ws-head">Workspaces</div>' +
        (err ? '<div class="ws-err">' + esc(err) + '</div>' : '') +
        '<div class="ws-list">' +
        (workspaces.length ? workspaces.map(wsRow).join('') : '<div class="ws-empty">No workspaces yet.</div>') +
        '</div>' +
        '<form class="ws-newf" data-emit="new-ws">' +
        '<span class="ws-icw">' + ic('plus') + '</span>' +
        '<input name="name" class="ws-in" placeholder="new-workspace" maxlength="40" required>' +
        '<button type="submit" class="ws-btn">Create</button></form>'
      );
    }
    const bytes = files.reduce((n, f) => n + f.size, 0);
    return (
      '<div class="ws-head"><button class="ws-btn" data-emit="back" title="All workspaces">' + ic('back') + '</button>' +
      '<span class="ws-wname">' + esc(ws) + '</span>' +
      '<span class="ws-meta">' + files.length + ' file' + (files.length === 1 ? '' : 's') + ' · ' + fmt(bytes) + '</span>' +
      '<button class="ws-btn" data-emit="export" title="Download all as one file">' + ic('download') + '</button></div>' +
      (err ? '<div class="ws-err">' + esc(err) + '</div>' : '') +
      (status ? '<div class="ws-status">' + esc(status) + '</div>' : '') +
      '<div class="ws-list">' +
      (files.length ? files.map(fileRow).join('') : '<div class="ws-empty">Empty — write a file.</div>') +
      '</div>' +
      '<form class="ws-newf" data-emit="new-file">' +
      '<span class="ws-icw">' + ic('plus') + '</span>' +
      '<input name="path" class="ws-in" placeholder="new/file.md" maxlength="180" required>' +
      '<button type="submit" class="ws-btn">Create</button></form>' +
      previewHtml()
    );
  };

  ui.on('pick', async (name) => {
    const n = String(name || '');
    if (!ws) {
      ws = n;
      preview = editing = null;
      await refresh();
      return;
    }
    if (editing) return;
    try {
      const st = await caelune.files.stat(ws, n);
      const r = await caelune.files.read(ws, n, { length: EDIT_MAX });
      preview = { path: n, text: r.content + (r.hasMore ? '\n…' : ''), size: st ? st.size : r.size };
      render();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('back', () => {
    ws = '';
    preview = editing = null;
    refresh();
  });

  ui.on('dl', async (p) => {
    try {
      await caelune.files.download(ws, String(p));
      status = 'Sent to downloads.';
      render();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('export', async () => {
    try {
      status = 'Exporting…';
      render();
      await caelune.files.download(ws); // no path → whole-ws markdown bundle
      status = 'Exported ' + files.length + ' files as ' + ws + '-export.md';
      render();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('del', async (p) => {
    try {
      await caelune.files.remove(ws, String(p));
      if (preview && preview.path === p) preview = null;
      if (editing && editing.path === p) editing = null;
      await refresh();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('new-file', async (data) => {
    try {
      const p = String((data && data.path) || '').trim();
      if (!p) return;
      await caelune.files.write(ws, p, '');
      await refresh();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('new-ws', async (data) => {
    try {
      const n = String((data && data.name) || '').trim();
      if (!n) return;
      await caelune.files.createWs(n);
      await refresh();
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('edit', async (p) => {
    try {
      const r = await caelune.files.read(ws, String(p), { length: EDIT_MAX });
      editing = { path: String(p), text: r.content };
      ui.html('.ws-body', html()); // one forced render — the edit form itself
    } catch (e) {
      err = String(e && e.message ? e.message : e);
      render();
    }
  });

  ui.on('cancel-edit', () => {
    editing = null;
    lastJson = '';
    render();
  });

  ui.on('save', async (data) => {
    try {
      const p = String((data && data.path) || '');
      await caelune.files.write(ws, p, String((data && data.content) ?? ''));
      editing = null;
      preview = null;
      lastJson = '';
      status = 'Saved ' + p;
      await refresh();
    } catch (e) {
      // Keep the user's text — the submitted FormData IS their edit.
      editing = { path: p, text: String((data && data.content) ?? '') };
      err = String(e && e.message ? e.message : e);
      ui.html('.ws-body', html());
    }
  });

  refresh();
  setInterval(() => {
    if (!editing) refresh();
  }, 4000);
});
