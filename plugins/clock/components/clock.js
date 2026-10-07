caelune.component('clock-card', ({ ui, props }) => {
  const tz = typeof props.timezone === 'string' && props.timezone ? props.timezone : undefined;
  const zone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  const tick = () => {
    const now = new Date();
    ui.text(
      '.clock-time',
      new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now),
    );
    ui.text(
      '.clock-date',
      new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(now),
    );
    ui.text('.clock-zone', zone);
  };
  tick();
  setInterval(tick, 1000);
});
