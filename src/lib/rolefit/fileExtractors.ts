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
  height: number;
  items: PdfPositionedItem[];
}

function reconstructPageLines(items: PdfPositionedItem[]): string {
  const nonEmpty = items.filter((item) => item.str.length > 0);
  if (nonEmpty.length === 0) return '';

  // Sort primarily top-to-bottom (higher Y first in PDF coordinates), then left-to-right (lower X first)
  const sorted = [...nonEmpty].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 2) return yDiff;
    return a.x - b.x;
  });

  const lines: ReconstructedLine[] = [];

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

  // Final top-to-bottom order
  lines.sort((a, b) => b.y - a.y);

  const heights = lines.map((l) => l.height).filter((h) => h > 0);
  const avgHeight =
    heights.length > 0
      ? heights.reduce((sum, h) => sum + h, 0) / heights.length
      : 11;

  const outputLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Sort items strictly left-to-right within each reconstructed line
    line.items.sort((a, b) => a.x - b.x);

    let lineText = '';
    for (let j = 0; j < line.items.length; j++) {
      const curr = line.items[j];
      if (j === 0) {
        lineText += curr.str;
        continue;
      }

      const prev = line.items[j - 1];
      const prevEnd = prev.x + prev.width;
      const gap = curr.x - prevEnd;
      const spaceThreshold = Math.max(1.5, curr.height * 0.18);
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

    const cleanedLine = lineText.replace(/\u00A0/g, ' ').trim();
    if (!cleanedLine) continue;

    // Preserve visual paragraph/section breaks when vertical gap is noticeably larger than line spacing
    if (i > 0 && outputLines.length > 0) {
      const prevLine = lines[i - 1];
      const verticalGap = prevLine.y - line.y;
      if (verticalGap > Math.max(avgHeight * 1.75, 18)) {
        outputLines.push('');
      }
    }

    outputLines.push(cleanedLine);
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

      const reconstructed = reconstructPageLines(positioned);
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
