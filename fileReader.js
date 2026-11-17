// Image (Tesseract.js) and PDF (PDF.js) reading. OCR output is only a draft for the user to review.
const FR = {
  async ocr(src, onStatus) {
    const { data } = await Tesseract.recognize(src, 'eng', { logger: m => m.status && onStatus(`${m.status} ${Math.round((m.progress || 0) * 100)}%`) });
    return data.text;
  },
  async read(file, onStatus) {
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p), tc = await page.getTextContent();
        let t = tc.items.map(i => i.str + (i.hasEOL ? '\n' : '')).join(' ');
        if (t.replace(/\s/g, '').length < 5) { // scanned page: render, then OCR
          const vp = page.getViewport({ scale: 2 }), cv = document.createElement('canvas');
          cv.width = vp.width; cv.height = vp.height;
          await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
          t = await FR.ocr(cv, onStatus);
        }
        out += t + '\n';
      }
      return out;
    }
    return FR.ocr(file, onStatus);
  },
  clean(text) {
    return text.split('\n').map(l => l.replace(/[−–—]/g, '-').replace(/×/g, '*').trim()).filter(l => l.includes('=')).join('\n');
  }
};
