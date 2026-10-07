const STORE_KEY = 'events';
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const pad = (n) => String(n).padStart(2, '0');
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const load = async () => {
  const v = await caelune.storage.get(STORE_KEY);
  return Array.isArray(v) ? v : [];
};
const save = (events) => caelune.storage.set(STORE_KEY, events);

const clampMonth = (v, dflt) => {
  const n = parseInt(v, 10);
  return n >= 1 && n <= 12 ? n : dflt;
};
const clampYear = (v, dflt) => {
  const n = parseInt(v, 10);
  return n >= 1970 && n <= 2100 ? n : dflt;
};
const sorted = (events) =>
  [...events].sort((a, b) =>
    String(a.date + ' ' + (a.time || '99:99')).localeCompare(
      String(b.date + ' ' + (b.time || '99:99')),
    ),
  );
const monthFilter = (input) => {
  if (!input.year && !input.month) return () => true;
  const now = new Date();
  const p =
    clampYear(input.year, now.getFullYear()) + '-' + pad(clampMonth(input.month, now.getMonth() + 1));
  return (e) => typeof e.date === 'string' && e.date.startsWith(p);
};
const line = (e) => e.date + (e.time ? ' ' + e.time : '') + ' — ' + e.title + '  [' + e.id + ']';
const card = (date) => ({
  component: 'cal-card',
  props: date ? { month: +date.slice(5, 7), year: +date.slice(0, 4), select: date } : {},
});

const todayIso = () => {
  const n = new Date();
  return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate());
};

caelune.tool('month_calendar', async (input) => {
  const now = new Date();
  const month = clampMonth(input.month, now.getMonth() + 1);
  const year = clampYear(input.year, now.getFullYear());
  const n = (await load()).filter(monthFilter({ month, year })).length;
  return {
    content:
      'Showing ' + MONTHS[month - 1] + ' ' + year + ' — ' + n + ' event' + (n === 1 ? '' : 's') +
      '. Today is ' + todayIso() + ' (use it to resolve relative dates).',
    render: { component: 'cal-card', props: { month, year } },
  };
});

caelune.tool('add_event', async (input) => {
  const date = String(input.date ?? '').trim();
  if (!ISO_RE.test(date) || isNaN(new Date(date + 'T00:00:00').getTime()))
    return { content: 'date must be an ISO date like 2026-10-15' };
  const title = String(input.title ?? '').trim().slice(0, 120);
  if (!title) return { content: 'title is required' };
  const t = String(input.time ?? '').trim();
  const time = /^([01]?\d|2[0-3]):[0-5]\d$/.test(t) ? t.padStart(5, '0') : '';
  const events = await load();
  const ev = { id: 'ev_' + Date.now().toString(36) + events.length, date, title, time };
  events.push(ev);
  await save(events);
  return {
    content: 'Added "' + title + '" on ' + date + (time ? ' at ' + time : '') + '  [' + ev.id + ']',
    render: card(date),
  };
});

caelune.tool('list_events', async (input) => {
  const events = sorted(await load()).filter(monthFilter(input));
  if (!events.length) return { content: 'No events stored' };
  const body = events.slice(0, 50).map(line).join('\n');
  return {
    content:
      'Today is ' + todayIso() + '. ' +
      events.length + ' event' + (events.length === 1 ? '' : 's') + ':\n' + body +
      (events.length > 50 ? '\n…' : ''),
  };
});

caelune.tool('remove_event', async (input) => {
  const events = await load();
  const i = events.findIndex((e) => e.id === input.id);
  if (i === -1) return { content: 'No event with id ' + input.id + ' — run list_events for ids' };
  const [ev] = events.splice(i, 1);
  await save(events);
  return {
    content: 'Removed "' + ev.title + '" (' + ev.date + (ev.time ? ' ' + ev.time : '') + ')',
    render: card(ev.date),
  };
});
