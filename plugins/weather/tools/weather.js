const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const WX = 'https://api.open-meteo.com/v1/forecast';

/** WMO weather-code → {label, glyph} — see open-meteo docs. */
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'], 45: ['Fog', '🌫️'], 48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '❄️'],
  80: ['Light showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Heavy showers', '🌧️'],
  85: ['Snow showers', '🌨️'], 86: ['Snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm + hail', '⛈️'], 99: ['Thunderstorm + hail', '⛈️'],
};
const wmo = (c) => CODES[c] ?? ['—', '·'];

caelune.tool('get_weather', async (input) => {
  const city = String(input.city ?? '').trim().slice(0, 80);
  if (!city) return { content: 'city is required' };

  const geo = await caelune
    .fetch(GEO + '?name=' + encodeURIComponent(city) + '&count=1&language=en&format=json')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const place = geo?.results?.[0];
  if (!place) return { content: 'Could not find a place called "' + city + '"' };

  const q =
    'latitude=' + place.latitude + '&longitude=' + place.longitude +
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto';
  const wx = await caelune
    .fetch(WX + '?' + q)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const cur = wx?.current;
  if (!cur) return { content: 'Weather data unavailable for ' + place.name + ' right now' };

  const [label, glyph] = wmo(cur.weather_code);
  const name = place.name + (place.country ? ', ' + place.country : '');
  const days = (wx.daily?.time ?? []).slice(1).map((d, i) => ({
    date: d,
    min: Math.round(wx.daily.temperature_2m_min[i + 1]),
    max: Math.round(wx.daily.temperature_2m_max[i + 1]),
    code: wx.daily.weather_code[i + 1],
  }));

  return {
    content:
      name + ' — ' + Math.round(cur.temperature_2m) + '°C, ' + label.toLowerCase() +
      ' · humidity ' + cur.relative_humidity_2m + '% · wind ' +
      Math.round(cur.wind_speed_10m) + ' km/h. Next days: ' +
      days.map((d) => d.date.slice(5) + ' ' + d.min + '–' + d.max + '°').join(', '),
    render: {
      component: 'weather-card',
      props: {
        place: name,
        temp: Math.round(cur.temperature_2m),
        label,
        glyph,
        humidity: cur.relative_humidity_2m,
        wind: Math.round(cur.wind_speed_10m),
        days,
      },
    },
  };
});
