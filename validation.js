// Input validation and equation parsing (exact fractions via Math.js)
const V = {
  num(s) {
    s = String(s).trim().replace(/[−–—]/g, '-').replace(/^\+/, '');
    if (!/^-?(\d+\.?\d*|\.\d+)(\/\d+)?$/.test(s)) return null;
    try {
      if (s.includes('/')) { const [a, b] = s.split('/'); if (+b === 0) return null; return math.divide(math.fraction(a), math.fraction(b)); }
      return math.fraction(s);
    } catch (e) { return null; }
  },
  eq(line) {
    const raw = line; line = line.replace(/[−–—]/g, '-').replace(/\s+/g, '');
    const sides = line.split('=');
    if (sides.length !== 2 || !sides[0] || !sides[1]) throw new Error(`"${raw.trim()}": needs one left side, one "=" and one right side.`);
    const co = {}; let k = math.fraction(0);
    sides.forEach((s, si) => {
      const sg = math.fraction(si ? -1 : 1), re = /([+-]?)(\d*\.?\d+(?:\/\d+)?|\d+\.)?\*?([a-zA-Z]\d*)?/y;
      let pos = 0;
      while (pos < s.length) {
        re.lastIndex = pos; const m = re.exec(s);
        if (!m || !m[0] || (!m[2] && !m[3])) throw new Error(`"${raw.trim()}": cannot read "${s.slice(pos)}".`);
        pos += m[0].length;
        let c = m[2] ? V.num(m[2]) : math.fraction(1);
        if (!c) throw new Error(`"${raw.trim()}": "${m[2]}" is not a valid number.`);
        if (m[1] === '-') c = math.unaryMinus(c);
        c = math.multiply(c, sg);
        if (m[3]) co[m[3]] = math.add(co[m[3]] || math.fraction(0), c); else k = math.subtract(k, c);
      }
    });
    return { co, k };
  },
  system(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean), errors = [], parsed = [], vars = [];
    if (!lines.length) return { errors: ['Enter at least one equation.'] };
    lines.forEach((l, i) => { try { const p = V.eq(l); parsed.push(p); Object.keys(p.co).forEach(v => !vars.includes(v) && vars.push(v)); } catch (e) { errors.push(`Equation ${i + 1}: ${e.message}`); } });
    if (errors.length) return { errors };
    if (!vars.length) return { errors: ['No variables found.'] };
    return { vars, rows: parsed.map(p => [...vars.map(v => p.co[v] || math.fraction(0)), p.k]), errors: [] };
  }
};
