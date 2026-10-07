caelune.component('weather-card', ({ ui, props }) => {
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* Lucide path data — plugin workers can't import the library, so the
   * needed glyphs ride along as SVG strings. */
  const P = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' +
      '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
      '<path d="M2 12h2"/><path d="M20 12h2"/>' +
      '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'cloud-sun': '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/>' +
      '<path d="m19.07 4.93-1.41 1.41"/><path d="M15.95 12.65a4 4 0 0 0-5.93-4.13"/>' +
      '<path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    fog: '<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/>' +
      '<path d="M16 17H7"/><path d="M17 21H9"/>',
    drizzle: '<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/>' +
      '<path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/>' +
      '<path d="M12 21v1"/><path d="M12 16v1"/>',
    rain: '<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/>' +
      '<path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
    snow: '<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/>' +
      '<path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/>' +
      '<path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>',
    storm: '<path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97"/>' +
      '<path d="m13 12-3 5h4l-3 5"/>',
  };
  const ic = (name, s) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round">' + (P[name] ?? P.cloud) + '</svg>';

  ui.text('.wx-place', String(props.place ?? ''));
  ui.html('.wx-glyph', ic(String(props.icon ?? 'cloud'), 34));
  ui.text('.wx-temp', props.temp !== undefined ? props.temp + '°' : '—');
  ui.text('.wx-label', String(props.label ?? ''));
  ui.text(
    '.wx-sub',
    'humidity ' + (props.humidity ?? '—') + '% · wind ' + (props.wind ?? '—') + ' km/h',
  );
  ui.html(
    '.wx-days',
    (Array.isArray(props.days) ? props.days : [])
      .map((d) => {
        const wd = WD[new Date(String(d.date) + 'T00:00:00').getDay()] ?? '';
        return (
          '<div class="wx-day"><div class="d">' + wd + '</div>' +
          '<div class="g">' + ic(String(d.icon ?? 'cloud'), 16) + '</div>' +
          '<div class="t"><b>' + d.max + '°</b> ' + d.min + '°</div></div>'
        );
      })
      .join(''),
  );
});
