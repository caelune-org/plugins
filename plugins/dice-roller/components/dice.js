component('dice-card', (ui, props) => {
  let { notation, rolls, total } = props;
  const paint = () => {
    ui.text('.label', notation);
    ui.text('.total', String(total));
    ui.text('.rolls', 'rolls: ' + rolls.join(' · '));
  };
  paint();
  ui.on('reroll', () => {
    const m = /^(\d+)d(\d+)$/i.exec(notation);
    const count = parseInt(m?.[1] ?? '1', 10);
    const sides = parseInt(m?.[2] ?? '6', 10);
    rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
    total = rolls.reduce((a, b) => a + b, 0);
    paint();
  });
});
