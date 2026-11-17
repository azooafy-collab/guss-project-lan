// Gaussian elimination with exact fractions; every operation is recorded as a step.
const G = {
  fmt: x => math.format(x, { fraction: 'ratio' }),
  solve(A, m) {
    const M = A.map(r => r.slice()), n = M.length, steps = [], P = [], fmt = G.fmt;
    const z = x => math.equal(x, 0), snap = () => M.map(r => r.slice());
    const st = (stage, type, text, op, hl, fn) => { const before = snap(); fn(); steps.push({ stage, type, text, op, hl, before, after: snap() }); };
    const comb = (i, r, f) => { M[i] = M[i].map((x, j) => math.subtract(x, math.multiply(f, M[r][j]))); };
    const opText = (i, r, f) => { const af = math.abs(f), cf = math.equal(af, 1) ? '' : `(${fmt(af)})`; return `R${i + 1} → R${i + 1} ${math.smaller(f, 0) ? '+' : '−'} ${cf}R${r + 1}`; };
    let r = 0;
    for (let c = 0; c < m && r < n; c++) {
      let p = -1, best = math.fraction(0);
      for (let i = r; i < n; i++) { const a = math.abs(M[i][c]); if (math.larger(a, best)) { best = a; p = i; } }
      if (p < 0) continue; // no pivot in this column
      if (p !== r) st(1, 'Row swap', `Column ${c + 1}: partial pivoting picks the entry with the largest magnitude, ${fmt(M[p][c])} in row ${p + 1}, as the pivot. Rows ${r + 1} and ${p + 1} trade places.`, `R${r + 1} ↔ R${p + 1}`, { pr: r, pc: c, target: p, ref: r }, () => { [M[r], M[p]] = [M[p], M[r]]; });
      for (let i = r + 1; i < n; i++) {
        if (z(M[i][c])) continue;
        const f = math.divide(M[i][c], M[r][c]);
        st(1, 'Elimination', `The pivot ${fmt(M[r][c])} is at row ${r + 1}, column ${c + 1}. To zero the entry ${fmt(M[i][c])} below it, subtract ${fmt(f)} times row ${r + 1} from row ${i + 1}.`, opText(i, r, f), { pr: r, pc: c, target: i, ref: r }, () => comb(i, r, f));
      }
      P.push([r, c]); r++;
    }
    const refEnd = steps.length;
    for (let k = P.length - 1; k >= 0; k--) {
      const [pr, pc] = P[k], pv = M[pr][pc];
      if (!math.equal(pv, 1)) st(2, 'Normalize', `Scale row ${pr + 1} by 1/${fmt(pv)} so its pivot becomes exactly 1.`, `R${pr + 1} → (1/${fmt(pv)})·R${pr + 1}`, { pr, pc, target: pr, ref: pr }, () => { M[pr] = M[pr].map(x => math.divide(x, pv)); });
      for (let i = 0; i < pr; i++) {
        if (z(M[i][pc])) continue;
        const f = M[i][pc];
        st(2, 'Eliminate above', `The pivot in column ${pc + 1} is 1. Clear the entry ${fmt(f)} above it using row ${pr + 1}.`, opText(i, pr, f), { pr, pc, target: i, ref: pr }, () => comb(i, pr, f));
      }
    }
    let type = 'unique', bad = -1;
    for (let i = 0; i < n; i++) if (M[i].slice(0, m).every(z) && !z(M[i][m])) { bad = i; type = 'none'; break; }
    const pcols = P.map(p => p[1]), free = [...Array(m).keys()].filter(c => !pcols.includes(c));
    if (type !== 'none' && free.length) type = 'infinite';
    return { steps, refEnd, init: A, final: M, pivots: P, free, type, bad, m, n };
  },
  analysis(res, vars) {
    const f = G.fmt, { final: M, m } = res;
    if (res.type === 'none') return `<h3>No solution</h3><p>Row ${res.bad + 1} of the final matrix reads <b>0 = ${f(M[res.bad][m])}</b>, a contradiction. No values of the variables satisfy it, so the system is inconsistent.</p>`;
    if (res.type === 'unique') return `<h3>Unique solution</h3>` + res.pivots.map(([r, c]) => `<div class="eq">${vars[c]} = ${f(M[r][m])}</div>`).join('') + `<p>Every variable has a pivot, so exactly one solution exists.</p>`;
    let h = `<h3>Infinitely many solutions</h3><p>Pivot variables: <b>${res.pivots.map(p => vars[p[1]]).join(', ')}</b>. Free variables: <b>${res.free.map(c => vars[c]).join(', ')}</b> (any real value).</p>`;
    res.pivots.forEach(([r, c]) => {
      let s = f(M[r][m]);
      res.free.forEach(fc => { const k = M[r][fc]; if (!math.equal(k, 0)) { const a = math.abs(k); s += (math.smaller(k, 0) ? ' + ' : ' − ') + (math.equal(a, 1) ? '' : f(a)) + vars[fc]; } });
      h += `<div class="eq">${vars[c]} = ${s}</div>`;
    });
    return h + res.free.map(c => `<div class="eq">${vars[c]} is free</div>`).join('');
  }
};
