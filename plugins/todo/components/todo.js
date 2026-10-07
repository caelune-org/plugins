caelune.component('todo-card', async ({ ui }) => {
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let todos = [];
  const refresh = async () => {
    const v = await caelune.storage.get('todos');
    todos = Array.isArray(v) ? v : [];
  };

  const render = () => {
    const done = todos.filter((t) => t.done).length;
    ui.text('.td-count', todos.length ? todos.length - done + ' pending · ' + done + ' done' : '');
    ui.html(
      '.td-list',
      todos.length
        ? todos
            .map(
              (t) =>
                '<div class="td-row' + (t.done ? ' done' : '') + '">' +
                '<span class="td-check' + (t.done ? ' on' : '') + '" data-emit="toggle" data-value="' +
                esc(t.id) + '">' + (t.done ? '✓' : '') + '</span>' +
                '<span class="td-text">' + esc(t.title) + '</span>' +
                '<button class="td-del" data-emit="del" data-value="' + esc(t.id) + '">✕</button>' +
                '</div>',
            )
            .join('')
        : '<div class="td-empty">All clear — nothing to do</div>',
    );
  };

  const mutate = async (fn) => {
    await refresh();
    fn();
    await caelune.storage.set('todos', todos);
    render();
  };

  ui.on('toggle', (v) =>
    mutate(() => {
      const t = todos.find((x) => x.id === v);
      if (t) t.done = !t.done;
    }),
  );
  ui.on('del', (v) =>
    mutate(() => {
      const i = todos.findIndex((x) => x.id === v);
      if (i >= 0) todos.splice(i, 1);
    }),
  );

  await refresh();
  render();

  // Pick up writes other tool calls make while this card lives.
  const poll = setInterval(async () => {
    const before = JSON.stringify(todos);
    await refresh();
    if (JSON.stringify(todos) !== before) render();
  }, 3000);
  ui.on('unmount', () => clearInterval(poll));
});
