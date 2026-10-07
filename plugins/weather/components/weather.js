caelune.component('weather-card', ({ ui, props }) => {
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const wmoGlyph = (c) =>
    ({ 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️',
       55: '🌧️', 56: '🌧️', 57: '🌧️', 61: '🌦️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
       71: '🌨️', 73: '🌨️', 75: '❄️', 77: '❄️', 80: '🌦️', 81: '🌧️', 82: '🌧️',
       85: '🌨️', 86: '🌨️', 95: '⛈️', 96: '⛈️', 99: '⛈️' })[c] ?? '·';

  ui.text('.wx-place', String(props.place ?? ''));
  ui.text('.wx-glyph', String(props.glyph ?? ''));
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
          '<div class="g">' + wmoGlyph(d.code) + '</div>' +
          '<div class="t"><b>' + d.max + '°</b> ' + d.min + '°</div></div>'
        );
      })
      .join(''),
  );
});
