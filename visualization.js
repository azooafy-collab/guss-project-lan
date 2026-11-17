// Matrix rendering, highlighting and step navigation
const Viz = {
  res: null, vars: [], idx: 0, mode: 'step',
  h(x) {
    const s = G.fmt(x), m = s.match(/^(-?)(\d+)\/(\d+)$/);
    return m ? `${m[1]}<span class="fr"><i>${m[2]}</i><i>${m[3]}</i></span>` : s;
  },
  mat(M, hl = {}, arrow = false) {
    const m = M[0].length - 1;
    let t = '<table class="mx"><tr>' + this.vars.map(v => `<th>${v}</th>`).join('') + '<th class="k">=</th></tr>';
    M.forEach((row, i) => {
      t += '<tr>' + row.map((x, j) => {
        let c = j === m ? 'k ' : '';
        if (hl.pr === i && hl.pc === j) c += 'pv';
        else if (hl.pc === j && hl.target === i && hl.elim) c += 'el';
        else if (hl.target === i) c += 'tg';
        else if (hl.ref === i) c += 'rf';
        else if (hl.pc === j) c += 'ac';
        return `<td class="${c}">${this.h(x)}</td>`;
      }).join('') + '</tr>';
    });
    if (arrow && hl.pc !== undefined) t += '<tr class="arrow">' + Array.from({ length: m + 1 }, (_, j) => `<td>${j === hl.pc ? '▲' : ''}</td>`).join('') + '</tr>';
    return t + '</table>';
  },
  load(res, vars) { this.res = res; this.vars = vars; this.idx = 0; this.mode = 'step'; this.render(); },
  stepCard(k) {
    const s = this.res.steps[k - 1], hl = { ...s.hl, elim: s.type === 'Elimination' || s.type === 'Eliminate above' };
    return `<div class="step"><h4>Step ${k} of ${this.res.steps.length}: ${s.type} <small>(${s.stage === 1 ? 'REF stage' : 'RREF stage'})</small></h4><p>${s.text}</p>
      <span class="op">${s.op}</span><div class="pair"><div><small>Before</small>${this.mat(s.before, hl, true)}</div><span class="arr">→</span>
      <div><small>After</small>${this.mat(s.after, { target: s.hl.target })}</div></div></div>`;
  },
  render() {
    const r = this.res, N = r.steps.length, v = document.getElementById('view'), st = document.getElementById('stage'), out = document.getElementById('result');
    let html = '', showRes = false;
    if (this.mode === 'step') {
      if (this.idx === 0) html = `<div class="step"><h4>Starting point</h4><p>The augmented matrix. First we reach row echelon form (zeros below every pivot), then reduced form (each pivot is 1 with zeros above and below).${N === 0 ? ' No operations are needed here.' : ''}</p>${this.mat(r.init)}</div>`;
      else html = this.stepCard(this.idx);
      st.textContent = this.idx === 0 ? 'Original matrix' : this.idx <= r.refEnd ? 'Stage 1: building Row Echelon Form' : 'Stage 2: building Reduced Row Echelon Form';
      showRes = this.idx === N;
    } else if (this.mode === 'all') {
      html = `<div class="step"><h4>Original matrix</h4>${this.mat(r.init)}</div>` + r.steps.map((_, i) => this.stepCard(i + 1)).join('');
      st.textContent = 'Complete solution history'; showRes = true;
    } else if (this.mode === 'ref') {
      const M = r.refEnd ? r.steps[r.refEnd - 1].after : r.init;
      html = `<div class="step"><h4>Row Echelon Form (REF)</h4><p>Every pivot has only zeros below it. Reached after ${r.refEnd} operation(s).</p>${this.mat(M)}</div>`; st.textContent = 'REF';
    } else {
      html = `<div class="step"><h4>Reduced Row Echelon Form (RREF)</h4><p>Each pivot is 1 and is the only nonzero entry in its column.</p>${this.mat(r.final)}</div>`; st.textContent = 'RREF'; showRes = true;
    }
    v.innerHTML = html; out.innerHTML = showRes ? `<div class="res">${G.analysis(r, this.vars)}</div>` : '';
    document.getElementById('prev').disabled = this.mode === 'step' && this.idx === 0;
    document.getElementById('next').disabled = this.mode === 'step' && this.idx === N;
    [['all', 'all'], ['ref', 'viewRef'], ['rref', 'viewRref']].forEach(([m, id]) => document.getElementById(id).classList.toggle('on', this.mode === m));
  },
  next() { if (this.mode !== 'step') this.mode = 'step'; else if (this.idx < this.res.steps.length) this.idx++; this.render(); },
  prev() { if (this.mode !== 'step') this.mode = 'step'; else if (this.idx > 0) this.idx--; this.render(); },
  setMode(m) { this.mode = m; this.render(); },
  restart() { this.mode = 'step'; this.idx = 0; this.render(); }
};
