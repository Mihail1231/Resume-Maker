export const MAX_CV_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type CvExtractionErrorCode =
  | 'UNSUPPORTED_TYPE'
  | 'FILE_TOO_LARGE'
  | 'SCANNED_PDF'
  | 'EMPTY_DOCUMENT'
  | 'PARSE_FAILED';

export class CvExtractionError extends Error {
  code: CvExtractionErrorCode;

  constructor(code: CvExtractionErrorCode, message: string) {
    super(message);
    this.name = 'CvExtractionError';
    this.code = code;
  }
}

export interface ExtractedCvDocument {
  text: string;
  fileType: 'pdf' | 'docx';
  pageCount?: number;
}

interface PdfPositionedItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEOL: boolean;
}

interface ReconstructedLine {
  y: number;
  minX: number;
  maxX: number;
  height: number;
  items: PdfPositionedItem[];
  text: string;
}

const PURE_DATE_RAIL_REGEX =
  /^(?:(?:expected|exp\.?|since)\s+)?(?:(?:\d{1,2}[./-](?:19|20)\d{2})|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z.]*\s*(?:19|20)\d{2})|(?:(?:19|20)\d{2}))(?:\s*(?:–|—|-|to|\s)?\s*(?:present|current|now|today|heute|aktuell|(?:\d{1,2}[./-](?:19|20)\d{2})|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z.]*\s*(?:19|20)\d{2})|(?:(?:19|20)\d{2})))?$/i;

const BULLET_LINE_START_REGEX = /^[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\u25CB•▪◦‣●○·*-]\s*/;

function joinLineItems(items: PdfPositionedItem[]): string {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  let lineText = '';

  for (let j = 0; j < sorted.length; j++) {
    const curr = sorted[j];
    if (j === 0) {
      lineText += curr.str;
      continue;
    }

    const prev = sorted[j - 1];
    const prevEnd = prev.x + prev.width;
    const gap = curr.x - prevEnd;
    const spaceThreshold = Math.max(1.4, curr.height * 0.16);
    const wideGapThreshold = Math.max(12, curr.height * 1.4);

    const alreadySeparated = /\s$/.test(lineText) || /^\s/.test(curr.str);
    if (!alreadySeparated) {
      if (gap >= wideGapThreshold) {
        lineText += '  ';
      } else if (gap >= spaceThreshold) {
        lineText += ' ';
      }
    }
    lineText += curr.str;
  }

  return lineText.replace(/\u00A0/g, ' ').trim();
}

function groupIntoLines(items: PdfPositionedItem[]): ReconstructedLine[] {
  const nonEmpty = items.filter((item) => item.str.trim().length > 0);
  if (nonEmpty.length === 0) return [];

  const sorted = [...nonEmpty].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 2) return yDiff;
    return a.x - b.x;
  });

  const lines: Array<{ y: number; height: number; items: PdfPositionedItem[] }> = [];

  for (const item of sorted) {
    const tolerance = Math.max(3, item.height * 0.45);
    const existingLine = lines.find((line) => Math.abs(line.y - item.y) <= tolerance);
    if (existingLine) {
      existingLine.items.push(item);
      existingLine.height = Math.max(existingLine.height, item.height);
    } else {
      lines.push({
        y: item.y,
        height: item.height,
        items: [item],
      });
    }
  }

  lines.sort((a, b) => b.y - a.y);

  return lines
    .map((line) => {
      const minX = Math.min(...line.items.map((i) => i.x));
      const maxX = Math.max(...line.items.map((i) => i.x + i.width));
      const text = joinLineItems(line.items);
      return {
        y: line.y,
        minX,
        maxX,
        height: line.height,
        items: line.items,
        text,
      };
    })
    .filter((l) => l.text.length > 0);
}

/**
 * Detect European / DACH / HSG two-column "date-rail" pages where a narrow left rail
 * (~0-28% of page width) holds date ranges and the right column holds entry titles & bullets.
 * Pairs each left-rail date with the closest right-column entry by Y-coordinate and stitches
 * wrapped right-column header lines cleanly.
 */
function reconstructDateRailPage(
  items: PdfPositionedItem[],
  pageWidth: number
): string | null {
  const railMaxEnd = pageWidth * 0.32;
  const rightMinStart = pageWidth * 0.24;

  // Partition items into left-rail candidates vs right-column candidates
  const leftItems: PdfPositionedItem[] = [];
  const rightItems: PdfPositionedItem[] = [];

  for (const item of items) {
    if (item.str.trim() === '') continue;
    const itemEnd = item.x + item.width;
    if (item.x < rightMinStart && itemEnd <= railMaxEnd) {
      leftItems.push(item);
    } else {
      rightItems.push(item);
    }
  }

  if (leftItems.length === 0 || rightItems.length === 0) return null;

  const leftLines = groupIntoLines(leftItems);
  const pureDateLines = leftLines.filter((l) => PURE_DATE_RAIL_REGEX.test(l.text.trim()));

  // Require at least 2 pure date-rail lines to classify this page as a date-rail layout
  if (pureDateLines.length < 2) return null;

  // Check that right-column actually starts noticeably to the right of the date rail
  const dateRailMaxRight = Math.max(...pureDateLines.map((l) => l.maxX));
  const rightColumnCandidates = groupIntoLines(rightItems).filter(
    (l) => l.minX > dateRailMaxRight + 15
  );
  if (rightColumnCandidates.length < 2) return null;

  // Identify pure date-rail items by membership in pureDateLines so full-width sections
  // (like centered header, section headings, LANGUAGES, SKILLS, HOBBIES) stay untouched.
  const dateLineSet = new Set(pureDateLines);
  const dateItems = new Set<PdfPositionedItem>();
  for (const dl of dateLineSet) {
    for (const it of dl.items) dateItems.add(it);
  }

  const remainingItems = items.filter((it) => !dateItems.has(it));
  const mainLines = groupIntoLines(remainingItems);

  // Pair each pure left-rail date line with its closest right-column entry header line
  // within 12pt vertical tolerance (preferring non-bullet lines starting right of the date rail)
  const pairedDates = new Map<ReconstructedLine, string>();
  const unpairedDates: ReconstructedLine[] = [];

  for (const dateLine of pureDateLines) {
    let bestTarget: ReconstructedLine | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const candidate of mainLines) {
      if (candidate.minX <= dateRailMaxRight + 10) continue;
      if (BULLET_LINE_START_REGEX.test(candidate.text)) continue;

      const yDist = Math.abs(candidate.y - dateLine.y);
      if (yDist > 12) continue;

      // Prefer unassigned lines with smallest Y distance
      const alreadyUsedPenalty = pairedDates.has(candidate) ? 20 : 0;
      const score = yDist + alreadyUsedPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestTarget = candidate;
      }
    }

    if (bestTarget && !pairedDates.has(bestTarget)) {
      pairedDates.set(bestTarget, dateLine.text);
    } else {
      unpairedDates.push(dateLine);
    }
  }

  // Merge wrapped right-column entry header lines (e.g., "University of St. Gallen | ... | St. Gallen,"
  // followed directly by "Switzerland" at the same X margin and font height) before attaching the paired date.
  const mergedLines: Array<{ y: number; height: number; text: string; isHeaderWithDate?: boolean }> =
    [];

  for (let i = 0; i < mainLines.length; i++) {
    const line = mainLines[i];
    const pairedDate = pairedDates.get(line);

    if (pairedDate) {
      let combinedText = line.text;
      // Check if the immediate next line is a wrapped continuation of this right-column header
      const next = mainLines[i + 1];
      if (
        next &&
        !pairedDates.has(next) &&
        !BULLET_LINE_START_REGEX.test(next.text) &&
        Math.abs(next.minX - line.minX) <= 6 &&
        Math.abs(next.height - line.height) <= 1.2 &&
        line.y - next.y <= Math.max(line.height * 1.8, 18) &&
        next.text.length <= 75
      ) {
        combinedText = `${combinedText} ${next.text}`;
        i += 1; // consume wrapped header line
      }

      mergedLines.push({
        y: line.y,
        height: line.height,
        text: `${combinedText}   ${pairedDate}`,
        isHeaderWithDate: true,
      });
    } else {
      mergedLines.push({
        y: line.y,
        height: line.height,
        text: line.text,
      });
    }
  }

  // Re-insert any truly unpaired date lines in vertical Y order so nothing is ever lost
  for (const leftover of unpairedDates) {
    mergedLines.push({
      y: leftover.y,
      height: leftover.height,
      text: leftover.text,
    });
  }
  mergedLines.sort((a, b) => b.y - a.y);

  const heights = mergedLines.map((l) => l.height).filter((h) => h > 0);
  const avgHeight =
    heights.length > 0 ? heights.reduce((sum, h) => sum + h, 0) / heights.length : 10;

  const outputLines: string[] = [];
  for (let i = 0; i < mergedLines.length; i++) {
    const curr = mergedLines[i];
    if (i > 0 && outputLines.length > 0) {
      const prev = mergedLines[i - 1];
      const verticalGap = prev.y - curr.y;
      if (curr.isHeaderWithDate || verticalGap > Math.max(avgHeight * 1.75, 16)) {
        outputLines.push('');
      }
    }
    outputLines.push(curr.text);
  }

  return outputLines.join('\n');
}

function reconstructPageLines(items: PdfPositionedItem[], pageWidth: number): string {
  const nonEmpty = items.filter((item) => item.str.trim().length > 0);
  if (nonEmpty.length === 0) return '';

  // Try DACH / HSG two-column date-rail reconstruction first
  const dateRailOutput = reconstructDateRailPage(nonEmpty, pageWidth);
  if (dateRailOutput) {
    return dateRailOutput;
  }

  const lines = groupIntoLines(nonEmpty);
  const heights = lines.map((l) => l.height).filter((h) => h > 0);
  const avgHeight =
    heights.length > 0
      ? heights.reduce((sum, h) => sum + h, 0) / heights.length
      : 11;

  const outputLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.text) continue;

    // Preserve visual paragraph/section breaks when vertical gap is noticeably larger than line spacing
    if (i > 0 && outputLines.length > 0) {
      const prevLine = lines[i - 1];
      const verticalGap = prevLine.y - line.y;
      if (verticalGap > Math.max(avgHeight * 1.75, 18)) {
        outputLines.push('');
      }
    }

    outputLines.push(line.text);
  }

  return outputLines.join('\n');
}

/**
 * Extract readable text from a PDF ArrayBuffer 100% client-side using pdfjs-dist.
 * Dynamically imported at call time so Next.js static export never evaluates DOMMatrix at build time.
 */
export async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<ExtractedCvDocument> {
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  try {
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();

      const positioned: PdfPositionedItem[] = [];
      for (const rawItem of textContent.items) {
        if ('str' in rawItem && Array.isArray(rawItem.transform)) {
          const transform = rawItem.transform as number[];
          const height =
            Math.abs(transform[3]) || Math.abs(transform[0]) || rawItem.height || 10;
          positioned.push({
            str: rawItem.str,
            x: transform[4] ?? 0,
            y: transform[5] ?? 0,
            width: rawItem.width ?? 0,
            height,
            hasEOL: Boolean(rawItem.hasEOL),
          });
        }
      }

      const reconstructed = reconstructPageLines(positioned, viewport.width || 595);
      if (reconstructed.trim()) {
        pageTexts.push(reconstructed);
      }
    }

    const fullText = pageTexts.join('\n\n').trim();
    const meaningfulChars = fullText.replace(/\s+/g, '').length;

    if (meaningfulChars < 40) {
      throw new CvExtractionError(
        'SCANNED_PDF',
        'This PDF appears to be a scanned image or contains almost no selectable text. Please upload a text-based PDF/DOCX or switch to the "Paste CV Text" tab to paste your resume manually.'
      );
    }

    return {
      text: fullText,
      fileType: 'pdf',
      pageCount: pdf.numPages,
    };
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Extract raw text from a DOCX ArrayBuffer 100% client-side using mammoth.
 * Dynamically imported at call time for zero build-time/SSR bundle bloat.
 */
export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<ExtractedCvDocument> {
  const mammothModule = await import('mammoth');
  const extractRawText =
    mammothModule.extractRawText ||
    (mammothModule as unknown as { default?: typeof mammothModule }).default?.extractRawText;

  if (!extractRawText) {
    throw new CvExtractionError(
      'PARSE_FAILED',
      'DOCX parser could not be initialized in this browser.'
    );
  }

  const result = await extractRawText({ arrayBuffer });
  const text = (result.value || '').replace(/\r\n/g, '\n').trim();

  if (text.replace(/\s+/g, '').length < 20) {
    throw new CvExtractionError(
      'EMPTY_DOCUMENT',
      'No readable text was found inside this DOCX file. Try saving it as a standard Word document or use the "Paste CV Text" tab.'
    );
  }

  return {
    text,
    fileType: 'docx',
  };
}

/**
 * Validate and extract text from an uploaded PDF or DOCX File in the browser.
 */
export async function extractTextFromCvFile(file: File): Promise<ExtractedCvDocument> {
  if (file.size > MAX_CV_FILE_SIZE_BYTES) {
    throw new CvExtractionError(
      'FILE_TOO_LARGE',
      'File exceeds the 10 MB limit. Please upload a smaller PDF or DOCX resume.'
    );
  }

  const lowerName = file.name.toLowerCase();
  const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
  const isDocx =
    lowerName.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPdf && !isDocx) {
    throw new CvExtractionError(
      'UNSUPPORTED_TYPE',
      'Unsupported file type. Please upload a .pdf or .docx resume, or use the "Paste CV Text" tab.'
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (isPdf) {
      return await extractPdfText(arrayBuffer);
    }
    return await extractDocxText(arrayBuffer);
  } catch (err) {
    if (err instanceof CvExtractionError) {
      throw err;
    }
    throw new CvExtractionError(
      'PARSE_FAILED',
      `Could not read "${file.name}". Ensure it is a valid, password-free PDF or DOCX file, or paste your CV text manually.`
    );
  }
}
