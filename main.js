// Application controller
const $ = id => document.getElementById(id);
const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); };
const showErrors = list => { $('errors').innerHTML = list.map(e => `<div>• ${e}</div>`).join(''); };

document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === b));
  $('t-manual').hidden = b.dataset.t !== 'manual'; $('t-upload').hidden = b.dataset.t !== 'upload';
});
function fromText(text) {
  const r = V.system(text);
  if (r.errors.length) { showErrors(r.errors); toast('Some equations could not be read'); return; }
  showErrors([]); Mx.build(r.rows.length, r.vars.length, r.rows, r.vars); toast('Matrix ready. Check it, then solve.');
}
$('parseBtn').onclick = () => fromText($('eqText').value);
$('ocrParse').onclick = () => fromText($('ocrText').value);
$('gridBtn').onclick = () => {
  const n = +$('nIn').value, m = +$('mIn').value;
  if (!(n >= 1 && n <= 8 && m >= 1 && m <= 8)) return showErrors(['Equations and variables must each be between 1 and 8.']);
  showErrors([]); Mx.build(n, m, null);
};
$('file').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  $('ocrStatus').textContent = 'Reading file…';
  try {
    const raw = await FR.read(f, s => $('ocrStatus').textContent = s), eqs = FR.clean(raw);
    $('ocrText').value = eqs || raw;
    $('ocrStatus').textContent = eqs ? 'Done. Compare with your original, fix any misread sign, digit or variable, then press "Use these equations".' : 'No lines containing "=" were found. The raw text is below; edit it into equations.';
  } catch (err) { $('ocrStatus').textContent = 'Could not read this file: ' + err.message; }
};
$('solveBtn').onclick = () => {
  const r = Mx.read();
  if (r.errors.length) { showErrors(r.errors); toast('Fix the highlighted cells first'); return; }
  showErrors([]);
  $('solve').hidden = false; Viz.load(G.solve(r.rows, r.m), r.vars);
  $('solve').scrollIntoView({ behavior: 'smooth' });
};
$('next').onclick = () => Viz.next(); $('prev').onclick = () => Viz.prev();
$('all').onclick = () => Viz.setMode('all'); $('restart').onclick = () => Viz.restart();
$('viewRef').onclick = () => Viz.setMode('ref'); $('viewRref').onclick = () => Viz.setMode('rref');
fromText($('eqText').value);
