// Matrix grid creation, editing and reading
const Mx = {
  vars: [],
  names(m) { const d = ['x', 'y', 'z', 'w', 'v', 'u']; return Array.from({ length: m }, (_, i) => m <= 6 ? d[i] : 'x' + (i + 1)); },
  build(n, m, rows, vars) {
    this.vars = vars || this.names(m);
    const g = document.getElementById('grid'); g.className = 'mx';
    g.innerHTML = '<tr>' + this.vars.map(v => `<th>${v}</th>`).join('') + '<th class="k">=</th></tr>' +
      Array.from({ length: n }, (_, i) => '<tr>' + Array.from({ length: m + 1 }, (_, j) =>
        `<td class="${j === m ? 'k' : ''}"><input data-i="${i}" data-j="${j}" aria-label="Row ${i + 1}, column ${j + 1}" value="${rows ? G.fmt(rows[i][j]) : '0'}"></td>`).join('') + '</tr>').join('');
    g.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => inp.classList.toggle('bad', V.num(inp.value) === null)));
  },
  read() {
    const errors = [], inputs = [...document.querySelectorAll('#grid input')];
    if (!inputs.length) return { errors: ['Create a matrix first.'] };
    const n = Math.max(...inputs.map(i => +i.dataset.i)) + 1, m = Math.max(...inputs.map(i => +i.dataset.j));
    const rows = Array.from({ length: n }, () => Array(m + 1));
    inputs.forEach(inp => {
      const v = V.num(inp.value), i = +inp.dataset.i, j = +inp.dataset.j;
      inp.classList.toggle('bad', v === null);
      if (v === null) errors.push(`Row ${i + 1}, ${j === m ? 'constant' : 'variable ' + this.vars[j]}: "${inp.value}" is not a number. Fix just this cell.`);
      else rows[i][j] = v;
    });
    return { rows, m, vars: this.vars, errors };
  }
};
