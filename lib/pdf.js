// Minimal, dependency-free PDF writer.
//
// This project's network egress does not allow installing an npm PDF
// library (pdf-lib / pdfkit / puppeteer are all unavailable), so this
// module hand-writes valid PDF 1.4 byte streams directly using the
// standard (non-embedded) Helvetica / Helvetica-Bold base-14 fonts.
// That means only Latin-1 (WinAnsiEncoding) text renders correctly —
// non-Latin text is transliterated/stripped in `sanitizeText`.
//
// It is intentionally general-purpose (title + labeled fields + a
// simple table), so it can back more than just transcripts.

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const LINE_HEIGHT = 15;

function sanitizeText(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // WinAnsiEncoding covers Latin-1; strip anything outside printable ASCII
  // plus a few common punctuation substitutions so nothing renders as garbage.
  return str
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, (ch) => (ch === '\n' ? ' ' : ''))
    .trim();
}

function escapePdfString(str) {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function textOp(font, size, x, y, text) {
  const safe = escapePdfString(sanitizeText(text));
  return `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${safe}) Tj ET`;
}

function lineOp(x1, y1, x2, y2, width = 0.75) {
  return `${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

/**
 * Build a single- or multi-page PDF Buffer from a simple document model.
 *
 * doc = {
 *   title: string,
 *   subtitle?: string,
 *   meta: [{ label, value }],           // key/value block under the title
 *   table?: { headers: string[], rows: string[][], widths: number[] },
 *   footerNote?: string,
 * }
 */
function buildDocumentPdf(doc) {
  const pages = [];
  let ops = [];
  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    pages.push(ops);
    ops = [];
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (needed) => {
    if (y - needed < MARGIN) newPage();
  };

  // Title
  ops.push(textOp('F2', 18, MARGIN, y, doc.title || ''));
  y -= LINE_HEIGHT + 6;

  if (doc.subtitle) {
    ops.push(textOp('F1', 11, MARGIN, y, doc.subtitle));
    y -= LINE_HEIGHT;
  }

  y -= 6;
  ops.push(lineOp(MARGIN, y, PAGE_WIDTH - MARGIN, y));
  y -= LINE_HEIGHT + 4;

  // Meta block (label/value pairs, two columns)
  if (Array.isArray(doc.meta) && doc.meta.length) {
    const colWidth = (PAGE_WIDTH - MARGIN * 2) / 2;
    let col = 0;
    let rowStartY = y;

    doc.meta.forEach((item, idx) => {
      ensureSpace(LINE_HEIGHT * 2);
      const x = MARGIN + col * colWidth;
      ops.push(textOp('F1', 8.5, x, y, (item.label || '').toUpperCase()));
      ops.push(textOp('F2', 10.5, x, y - 12, item.value || '-'));

      col += 1;
      if (col > 1) {
        col = 0;
        y -= LINE_HEIGHT * 2 + 4;
      }
    });

    if (col !== 0) y -= LINE_HEIGHT * 2 + 4;

    y -= 8;
    ops.push(lineOp(MARGIN, y, PAGE_WIDTH - MARGIN, y));
    y -= LINE_HEIGHT + 6;
  }

  // Table
  if (doc.table && Array.isArray(doc.table.rows)) {
    const { headers, rows, widths } = doc.table;
    const totalWidth = PAGE_WIDTH - MARGIN * 2;
    const colWidths =
      widths && widths.length === headers.length
        ? widths.map((w) => w * totalWidth)
        : headers.map(() => totalWidth / headers.length);

    const drawRow = (cells, font, size) => {
      let x = MARGIN;
      cells.forEach((cell, i) => {
        ops.push(textOp(font, size, x, y, cell));
        x += colWidths[i];
      });
    };

    ensureSpace(LINE_HEIGHT * 2);
    drawRow(headers, 'F2', 9.5);
    y -= 6;
    ops.push(lineOp(MARGIN, y, PAGE_WIDTH - MARGIN, y));
    y -= LINE_HEIGHT;

    rows.forEach((row) => {
      ensureSpace(LINE_HEIGHT);
      drawRow(row, 'F1', 9.5);
      y -= LINE_HEIGHT;
    });

    y -= 6;
    ops.push(lineOp(MARGIN, y, PAGE_WIDTH - MARGIN, y));
    y -= LINE_HEIGHT + 6;
  }

  if (doc.footerNote) {
    ensureSpace(LINE_HEIGHT * 2);
    ops.push(textOp('F1', 8.5, MARGIN, y, doc.footerNote));
  }

  pages.push(ops);

  return renderPdf(pages);
}

function renderPdf(pages) {
  const objects = [];

  // 1: Catalog, 2: Pages — filled in after we know page object numbers.
  objects.push(null); // placeholder index 0 -> object 1 (Catalog)
  objects.push(null); // placeholder index 1 -> object 2 (Pages)

  const fontHelveticaObjNum = 3;
  const fontHelveticaBoldObjNum = 4;

  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );

  const pageObjNums = [];
  const contentObjNums = [];

  pages.forEach((ops) => {
    const content = ops.join('\n');
    const contentObjIndex = objects.length; // 0-based
    objects.push({ stream: content });
    contentObjNums.push(contentObjIndex + 1);

    const pageObjIndex = objects.length;
    objects.push('__PAGE__'); // placeholder, filled below
    pageObjNums.push(pageObjIndex + 1);
  });

  // Fill in page objects now that we know contents object numbers.
  pageObjNums.forEach((pageNum, i) => {
    const contentNum = contentObjNums[i];
    objects[pageNum - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontHelveticaObjNum} 0 R /F2 ${fontHelveticaBoldObjNum} 0 R >> >> ` +
      `/Contents ${contentNum} 0 R >>`;
  });

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageObjNums
    .map((n) => `${n} 0 R`)
    .join(' ')}] /Count ${pageObjNums.length} >>`;

  // Serialize.
  let out = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((obj, idx) => {
    const objNum = idx + 1;
    offsets.push(out.length);

    if (obj && typeof obj === 'object' && 'stream' in obj) {
      const streamBytes = Buffer.byteLength(obj.stream, 'latin1');
      out += `${objNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${obj.stream}\nendstream\nendobj\n`;
    } else {
      out += `${objNum} 0 obj\n${obj}\nendobj\n`;
    }
  });

  const xrefStart = out.length;
  out += `xref\n0 ${objects.length + 1}\n`;
  out += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i += 1) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(out, 'latin1');
}

export { buildDocumentPdf, sanitizeText };
