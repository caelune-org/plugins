const STORE_KEY = 'todos';

const load = async () => {
  const v = await caelune.storage.get(STORE_KEY);
  return Array.isArray(v) ? v : [];
};
const save = (todos) => caelune.storage.set(STORE_KEY, todos);

const pending = (todos) => todos.filter((t) => !t.done);
const line = (t) => (t.done ? '[x] ' : '[ ] ') + t.title + '  (' + t.id + ')';
const summary = (todos) =>
  pending(todos).length + ' pending · ' + todos.filter((t) => t.done).length + ' done';
const card = () => ({ component: 'todo-card' });

caelune.tool('add_todo', async (input) => {
  const title = String(input.title ?? '').trim().slice(0, 200);
  if (!title) return { content: 'title is required' };
  const todos = await load();
  const todo = { id: 'td_' + Date.now().toString(36) + todos.length, title, done: false };
  todos.push(todo);
  await save(todos);
  return {
    content: 'Added "' + title + '" — ' + summary(todos) + '  [' + todo.id + ']',
    render: card(),
  };
});

caelune.tool('list_todos', async (input) => {
  const todos = await load();
  const show = input.done === true ? todos.filter((t) => t.done) : todos;
  if (!todos.length) return { content: 'The to-do list is empty', render: card() };
  return {
    content:
      summary(todos) + ':\n' +
      show.slice(0, 50).map(line).join('\n') +
      (show.length > 50 ? '\n…' : ''),
    render: card(),
  };
});

caelune.tool('toggle_todo', async (input) => {
  const todos = await load();
  const t = todos.find((x) => x.id === input.id);
  if (!t) return { content: 'No task with id ' + input.id + ' — run list_todos for ids' };
  t.done = !t.done;
  await save(todos);
  return {
    content: (t.done ? 'Completed' : 'Reopened') + ' "' + t.title + '" — ' + summary(todos),
    render: card(),
  };
});

caelune.tool('remove_todo', async (input) => {
  const todos = await load();
  const i = todos.findIndex((x) => x.id === input.id);
  if (i === -1) return { content: 'No task with id ' + input.id + ' — run list_todos for ids' };
  const [t] = todos.splice(i, 1);
  await save(todos);
  return {
    content: 'Removed "' + t.title + '" — ' + summary(todos),
    render: card(),
  };
});

caelune.tool('clear_completed', async () => {
  const todos = await load();
  const keep = pending(todos);
  const n = todos.length - keep.length;
  await save(keep);
  return {
    content: n ? 'Cleared ' + n + ' completed task' + (n === 1 ? '' : 's') : 'Nothing completed to clear',
    render: card(),
  };
});
