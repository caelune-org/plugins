caelune.component('cal-card', async ({ ui, props }) => {
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => y + '-' + pad(m + 1) + '-' + pad(d);
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const now = new Date();
  const cur = {
    y: Math.min(2100, Math.max(1970, parseInt(props.year, 10) || now.getFullYear())),
    m: Math.min(11, Math.max(0, (parseInt(props.month, 10) || now.getMonth() + 1) - 1)),
  };
  let selected = typeof props.select === 'string' ? props.select : iso(now.getFullYear(), now.getMonth(), now.getDate());
  let events = [];

  const refreshEvents = async () => {
    const v = await caelune.storage.get('events');
    events = Array.isArray(v) ? v : [];
  };
  const datesWith = () => {
    const set = Object.create(null);
    for (const e of events) if (typeof e.date === 'string') set[e.date] = true;
    return set;
  };

  const renderList = () => {
    const day = events
      .filter((e) => e.date === selected)
      .sort((a, b) => String(a.time || '99').localeCompare(String(b.time || '99')));
    ui.text('.cal-sel', selected);
    ui.html(
      '.cal-events',
      day.length
        ? day
            .map(
              (e) =>
                '<div class="ev"><span class="ev-time">' +
                esc(e.time || '—') +
                '</span>' +
                esc(e.title) +
                '</div>',
            )
            .join('')
        : '<div class="ev-none">No events</div>',
    );
  };

  const render = () => {
    const dots = datesWith();
    const first = new Date(cur.y, cur.m, 1).getDay();
    const days = new Date(cur.y, cur.m + 1, 0).getDate();
    const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
    let html = '';
    for (const w of ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']) {
      html += '<div class="wd">' + w + '</div>';
    }
    for (let i = 0; i < first; i++) html += '<div class="cell empty"></div>';
    for (let d = 1; d <= days; d++) {
      const ds = iso(cur.y, cur.m, d);
      let cls = 'cell';
      if (ds === today) cls += ' today';
      if (ds === selected) cls += ' sel';
      if (dots[ds]) cls += ' dot';
      html +=
        '<div class="' + cls + '" data-emit="day" data-value="' + ds + '">' + d + '</div>';
    }
    ui.text('.cal-month', MONTHS[cur.m] + ' ' + cur.y);
    ui.html('.cal-grid', html);
    renderList();
  };

  ui.on('nav', async (v) => {
    cur.m += parseInt(v, 10) || 0;
    if (cur.m < 0) { cur.m = 11; cur.y--; }
    if (cur.m > 11) { cur.m = 0; cur.y++; }
    render();
  });
  ui.on('day', (v) => {
    if (typeof v === 'string' && v) {
      selected = v;
      render();
    }
  });

  await refreshEvents();
  render();

  // Pick up events other tool calls (add/remove) write while this card lives.
  const poll = setInterval(async () => {
    const before = JSON.stringify(events);
    await refreshEvents();
    if (JSON.stringify(events) !== before) render();
  }, 4000);
  ui.on('unmount', () => clearInterval(poll));
});
