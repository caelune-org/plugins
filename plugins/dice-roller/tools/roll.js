tool('roll_dice', async (input) => {
  const m = /^(\d+)d(\d+)$/i.exec(String(input.notation || '1d6').trim());
  const count = Math.min(20, Math.max(1, parseInt(m?.[1] ?? '1', 10) || 1));
  const sides = Math.min(1000, Math.max(2, parseInt(m?.[2] ?? '6', 10) || 6));
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  const total = rolls.reduce((a, b) => a + b, 0);
  return {
    content: count + 'd' + sides + ' rolled [' + rolls.join(', ') + '] = ' + total,
    render: {
      component: 'dice-card',
      props: { notation: count + 'd' + sides, rolls, total },
    },
  };
});
