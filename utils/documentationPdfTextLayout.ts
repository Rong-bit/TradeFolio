import type { jsPDF } from 'jspdf';

const SLATE_800: [number, number, number] = [30, 41, 59];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_400: [number, number, number] = [148, 163, 184];
const SLATE_300: [number, number, number] = [203, 213, 225];

/** 不可放在行首（CJK 排版） */
const NO_BREAK_BEFORE = /[,:;!?)\]}>.]/;

type TextSegment = { text: string; bold: boolean };

export type RichTextStyle = {
  fontSize: number;
  lineHeight: number;
  color?: [number, number, number];
  gapBefore?: number;
  gapAfter?: number;
  x?: number;
  maxWidth?: number;
  forceBold?: boolean;
};

/**
 * Fontsource 繁中子集不含部分全形標點；改為 ASCII 或保留可顯示字元。
 * （「」、。等仍保留 App 內書名號與句號風格）
 */
export function normalizePdfPunctuation(text: string): string {
  return text
    .replace(/\uFF08/g, '(')
    .replace(/\uFF09/g, ')')
    .replace(/\uFF0C/g, ',')
    .replace(/\uFF1B/g, ';')
    .replace(/\uFF1A/g, ':')
    .replace(/\uFF0F/g, '/')
    .replace(/\u2192/g, '->')
    .replace(/\u3001/g, ',')
    .replace(/\u00D7/g, 'x')
    .replace(/\u2212|\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...');
}

function parseInlineSegments(text: string, forceBold = false): TextSegment[] {
  const normalized = normalizePdfPunctuation(text);
  if (!normalized.includes('**')) {
    return [{ text: normalized, bold: forceBold }];
  }

  const segments: TextSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: normalized.slice(lastIndex, match.index), bold: forceBold });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    segments.push({ text: normalized.slice(lastIndex), bold: forceBold });
  }

  return segments.filter(seg => seg.text.length > 0);
}

function measureSegment(pdf: jsPDF, segment: TextSegment, fontSize: number, fontFamily: string): number {
  pdf.setFont(fontFamily, segment.bold ? 'bold' : 'normal');
  pdf.setFontSize(fontSize);
  return pdf.getTextWidth(segment.text);
}

function appendCharToLine(line: TextSegment[], char: string, bold: boolean): void {
  const last = line[line.length - 1];
  if (last && last.bold === bold) {
    last.text += char;
  } else {
    line.push({ text: char, bold });
  }
}

/** 依字元換行，並遵守中文標點禁則 */
function wrapRichSegments(
  pdf: jsPDF,
  segments: TextSegment[],
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): TextSegment[][] {
  const lines: TextSegment[][] = [];
  let currentLine: TextSegment[] = [];
  let currentWidth = 0;

  const pushChar = (char: string, bold: boolean): void => {
    const charWidth = measureSegment(pdf, { text: char, bold }, fontSize, fontFamily);

    if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
      if (NO_BREAK_BEFORE.test(char)) {
        appendCharToLine(currentLine, char, bold);
        currentWidth += charWidth;
        return;
      }
      lines.push(currentLine);
      currentLine = [];
      currentWidth = 0;
    }

    appendCharToLine(currentLine, char, bold);
    currentWidth += charWidth;
  };

  for (const segment of segments) {
    for (const char of segment.text) {
      pushChar(char, segment.bold);
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export class DocumentationPdfWriter {
  private y: number;

  constructor(
    private readonly pdf: jsPDF,
    private readonly margin: number,
    private readonly pageWidth: number,
    private readonly pageHeight: number,
    private readonly fontFamily: string
  ) {
    this.y = margin;
  }

  private get maxWidth(): number {
    return this.pageWidth - this.margin * 2;
  }

  private ensureSpace(needed: number): void {
    if (this.y + needed > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.y = this.margin;
    }
  }

  private drawRichLine(
    segments: TextSegment[],
    x: number,
    y: number,
    fontSize: number,
    color: [number, number, number]
  ): void {
    this.pdf.setTextColor(...color);
    let cx = x;
    for (const segment of segments) {
      this.pdf.setFont(this.fontFamily, segment.bold ? 'bold' : 'normal');
      this.pdf.setFontSize(fontSize);
      this.pdf.text(segment.text, cx, y);
      cx += this.pdf.getTextWidth(segment.text);
    }
  }

  writeRichText(text: string, style: RichTextStyle): void {
    if (style.gapBefore) this.y += style.gapBefore;

    const fontSize = style.fontSize;
    const lineHeight = style.lineHeight;
    const color = style.color ?? SLATE_800;
    const x = style.x ?? this.margin;
    const maxWidth = style.maxWidth ?? this.maxWidth - (x - this.margin);
    const segments = parseInlineSegments(text, style.forceBold ?? false);
    const lines = wrapRichSegments(this.pdf, segments, maxWidth, fontSize, this.fontFamily);

    for (const line of lines) {
      this.ensureSpace(lineHeight);
      this.drawRichLine(line, x, this.y, fontSize, color);
      this.y += lineHeight;
    }

    this.pdf.setTextColor(...SLATE_800);
    if (style.gapAfter) this.y += style.gapAfter;
  }

  writeTitle(text: string): void {
    this.writeRichText(text.replace(/\*\*(.+?)\*\*/g, '$1'), {
      fontSize: 15,
      lineHeight: 7,
      gapBefore: 0,
      gapAfter: 3,
      forceBold: true,
    });
  }

  writeHeading(text: string, level: 2 | 4): void {
    const config =
      level === 2
        ? { fontSize: 13.5, lineHeight: 6.5, gapBefore: 5, gapAfter: 2 }
        : { fontSize: 12, lineHeight: 5.5, gapBefore: 4, gapAfter: 1 };

    this.writeRichText(text.replace(/\*\*(.+?)\*\*/g, '$1'), {
      ...config,
      forceBold: true,
    });
  }

  writeBlockquote(text: string): void {
    const fontSize = 10.5;
    const lineHeight = 5.5;
    const textX = this.margin + 6;
    const borderX = this.margin + 1.5;
    const maxWidth = this.maxWidth - 6;
    const segments = parseInlineSegments(text);
    const lines = wrapRichSegments(this.pdf, segments, maxWidth, fontSize, this.fontFamily);

    this.y += 2;
    const blockTop = this.y - lineHeight * 0.35;

    for (const line of lines) {
      this.ensureSpace(lineHeight);
      this.drawRichLine(line, textX, this.y, fontSize, SLATE_600);
      this.y += lineHeight;
    }

    this.y += 2;
    const blockBottom = this.y - lineHeight * 0.65;
    this.pdf.setDrawColor(...SLATE_300);
    this.pdf.setLineWidth(1.1);
    this.pdf.line(borderX, blockTop, borderX, blockBottom);
  }

  writeBullet(text: string): void {
    this.writeListItem('•', text, 2, 6.5, SLATE_400);
  }

  writeNumberedItem(index: string, text: string): void {
    this.writeListItem(`${index}.`, text, 2, 9, SLATE_800);
  }

  private writeListItem(
    marker: string,
    text: string,
    markerXOffset: number,
    textXOffset: number,
    markerColor: [number, number, number]
  ): void {
    const fontSize = 10.5;
    const lineHeight = 5.5;
    const markerX = this.margin + markerXOffset;
    const textX = this.margin + textXOffset;
    const maxWidth = this.maxWidth - textXOffset;
    const segments = parseInlineSegments(text);
    const lines = wrapRichSegments(this.pdf, segments, maxWidth, fontSize, this.fontFamily);

    for (let i = 0; i < lines.length; i++) {
      this.ensureSpace(lineHeight);
      if (i === 0) {
        this.pdf.setFont(this.fontFamily, 'normal');
        this.pdf.setFontSize(fontSize);
        this.pdf.setTextColor(...markerColor);
        this.pdf.text(marker, markerX, this.y);
      }
      this.drawRichLine(lines[i], textX, this.y, fontSize, SLATE_800);
      this.y += lineHeight;
    }

    this.y += 0.5;
  }

  writeParagraph(text: string): void {
    this.writeRichText(text, {
      fontSize: 10.5,
      lineHeight: 5.5,
      gapAfter: 0.5,
    });
  }

  writeBlankLine(): void {
    this.y += 2.5;
  }

  renderMarkdown(markdown: string): void {
    const lines = markdown.split('\n');
    if (lines.every(line => line.trim() === '')) {
      throw new Error('no_content');
    }

    for (const rawLine of lines) {
      if (rawLine.startsWith('### ')) {
        this.writeHeading(rawLine.slice(4), 4);
        continue;
      }
      if (rawLine.startsWith('## ')) {
        this.writeHeading(rawLine.slice(3), 2);
        continue;
      }
      if (rawLine.startsWith('# ')) {
        this.writeTitle(rawLine.slice(2));
        continue;
      }
      if (rawLine.startsWith('> ')) {
        this.writeBlockquote(rawLine.slice(2));
        continue;
      }
      if (/^[*-] /.test(rawLine)) {
        this.writeBullet(rawLine.slice(2));
        continue;
      }
      const numbered = rawLine.match(/^(\d+)\.\s+(.+)$/);
      if (numbered) {
        this.writeNumberedItem(numbered[1], numbered[2]);
        continue;
      }
      if (rawLine.trim() === '') {
        this.writeBlankLine();
        continue;
      }
      this.writeParagraph(rawLine);
    }
  }
}
