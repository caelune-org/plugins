tool('current_time', async (input) => {
  const tz =
    typeof input.timezone === 'string' && input.timezone.trim() ? input.timezone.trim() : undefined;
  const zone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return {
      content: `Current time in ${zone}: ${date} ${time}`,
      render: { component: 'clock-card', props: { timezone: tz } },
    };
  } catch {
    return { content: `Unknown timezone: ${String(input.timezone)}` };
  }
});
