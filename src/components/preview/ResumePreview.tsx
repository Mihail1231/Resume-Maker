'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { SpacingOption, SpacingStyles } from '@/types/resume';
import ModernTemplate from '../templates/ModernTemplate';
import ExecutiveTemplate from '../templates/ExecutiveTemplate';
import MinimalistTemplate from '../templates/MinimalistTemplate';
import { ZoomIn, ZoomOut, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

// 1 A4 page = 297mm = 1122.52px at 96 DPI (allow tiny subpixel tolerance)
const A4_HEIGHT_PX = 1123;
const A4_FIT_TOLERANCE_PX = 4;

const fontMap: Record<string, string> = {
  Inter: 'var(--font-inter), "Inter", ui-sans-serif, system-ui, sans-serif',
  Outfit: 'var(--font-outfit), "Outfit", ui-sans-serif, system-ui, sans-serif',
  'Plus Jakarta Sans':
    'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  Lora: 'var(--font-lora), "Lora", Georgia, "Times New Roman", serif',
  'Playfair Display':
    'var(--font-playfair-display), "Playfair Display", Georgia, "Times New Roman", serif',
  Merriweather: 'var(--font-merriweather), "Merriweather", Georgia, "Times New Roman", serif',
  'Roboto Mono': 'var(--font-roboto-mono), "Roboto Mono", ui-monospace, monospace',
};

const spacingMap: Record<SpacingOption, SpacingStyles> = {
  compact: {
    isCompact: true,
    pagePadding: 'px-[12mm] py-[9.5mm]',
    headerPadding: 'px-[11mm] pt-[7mm] pb-[5mm]',
    sectionGap: 'gap-2',
    entryGap: 'space-y-1.5',
    bulletGap: 'space-y-0.5',
    headingMargin: 'mb-1',
    photoSize: 'w-14 h-14',
    fontXs: '8pt',
    fontBase: '8.6pt',
    fontLg: '9.4pt',
    fontName: '18.5pt',
    lineHeight: '1.26',
  },
  normal: {
    isCompact: false,
    pagePadding: 'px-[14mm] py-[12mm]',
    headerPadding: 'px-[14mm] pt-[10mm] pb-[7mm]',
    sectionGap: 'gap-3.5',
    entryGap: 'space-y-2.5',
    bulletGap: 'space-y-1',
    headingMargin: 'mb-1.5',
    photoSize: 'w-16 h-16',
    fontXs: '8.7pt',
    fontBase: '9.6pt',
    fontLg: '10.6pt',
    fontName: '21pt',
    lineHeight: '1.38',
  },
  spacious: {
    isCompact: false,
    pagePadding: 'px-[16mm] py-[14mm]',
    headerPadding: 'px-[16mm] pt-[12mm] pb-[8mm]',
    sectionGap: 'gap-5',
    entryGap: 'space-y-3.5',
    bulletGap: 'space-y-1.5',
    headingMargin: 'mb-2.5',
    photoSize: 'w-20 h-20',
    fontXs: '9.5pt',
    fontBase: '10.5pt',
    fontLg: '11.5pt',
    fontName: '24pt',
    lineHeight: '1.48',
  },
};

export default function ResumePreview() {
  const { resumeData, setSpacing } = useResume();
  const [zoom, setZoom] = useState(0.85);
  const [pageTarget, setPageTarget] = useState<1 | 2>(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeightPx, setContentHeightPx] = useState<number>(A4_HEIGHT_PX);

  const { template, fontFamily, spacing } = resumeData;

  const activeSpacing = spacingMap[spacing] || spacingMap.compact;
  const activeFont = fontMap[fontFamily] || fontMap.Inter;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      // Measure actual unscaled template content height independent of min-height: 297mm and CSS scale()
      setContentHeightPx(Math.round(el.scrollHeight));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);

    const fontSet = typeof document !== 'undefined' ? document.fonts : undefined;
    let active = true;
    fontSet?.ready.then(() => {
      if (active) measure();
    });
    fontSet?.addEventListener?.('loadingdone', measure);

    return () => {
      active = false;
      observer.disconnect();
      fontSet?.removeEventListener?.('loadingdone', measure);
    };
  }, [resumeData, template, spacing, fontFamily]);

  const targetLimitPx = pageTarget * A4_HEIGHT_PX;
  const fitsTarget = contentHeightPx <= targetLimitPx + A4_FIT_TOLERANCE_PX;
  const fitsOnePage = contentHeightPx <= A4_HEIGHT_PX + A4_FIT_TOLERANCE_PX;
  const estimatedPages = Math.max(
    1,
    Math.ceil((contentHeightPx - A4_FIT_TOLERANCE_PX) / A4_HEIGHT_PX)
  );
  const visualSheetHeightPx = Math.max(A4_HEIGHT_PX, contentHeightPx);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.05, 1.3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.05, 0.5));
  const handleZoomReset = () => setZoom(0.85);

  const renderTemplate = () => {
    switch (template) {
      case 'executive':
        return <ExecutiveTemplate data={resumeData} s={activeSpacing} />;
      case 'minimalist':
        return <MinimalistTemplate data={resumeData} s={activeSpacing} />;
      case 'modern':
      default:
        return <ModernTemplate data={resumeData} s={activeSpacing} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Zoom & 1-Page Fit Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-border bg-surface-light no-print print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Live PDF Preview ({Math.round(zoom * 100)}%)
          </span>

          {/* Live A4 Page Fit Pill */}
          <span
            data-testid="a4-fit-status"
            data-content-height={contentHeightPx}
            data-page-target={pageTarget}
            title={`Content height: ${contentHeightPx}px vs. ${pageTarget}-page A4 target (${targetLimitPx}px)`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border no-print print:hidden ${
              fitsTarget
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
            }`}
          >
            {fitsTarget ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{pageTarget === 1 ? 'Fits 1 page' : 'Fits 2 pages'}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Spills to {estimatedPages} pages</span>
              </>
            )}
          </span>

          {/* Compact 1-Page / 2-Page Target Toggle */}
          <div
            role="group"
            aria-label="A4 page target"
            className="inline-flex items-center p-0.5 rounded-lg bg-surface border border-border text-[10px] font-semibold no-print print:hidden"
          >
            <button
              type="button"
              aria-pressed={pageTarget === 1}
              onClick={() => setPageTarget(1)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                pageTarget === 1
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              1 Page
            </button>
            <button
              type="button"
              aria-pressed={pageTarget === 2}
              onClick={() => setPageTarget(2)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                pageTarget === 2
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              2 Pages
            </button>
          </div>

          {!fitsTarget && spacing !== 'compact' && (
            <button
              type="button"
              onClick={() => setSpacing('compact')}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer no-print print:hidden"
            >
              Switch to Compact
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1.5 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors cursor-pointer"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Sheet Container */}
      <div className="flex-1 overflow-auto bg-surface/50 p-6 flex justify-center items-start">
        <div
          className="resume-sheet"
          data-font-family={fontFamily}
          data-template={template}
          style={{
            fontFamily: activeFont,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            marginBottom: `calc((${visualSheetHeightPx}px * ${zoom}) - ${visualSheetHeightPx}px)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <div ref={contentRef}>{renderTemplate()}</div>

          {/* Subtle A4 Page 1 Break / Boundary Guide (Screen only — strictly hidden in @media print) */}
          <div
            aria-hidden="true"
            className="page-break-guide no-print print:hidden pointer-events-none absolute left-0 right-0 flex items-center justify-end pr-2"
            style={{
              top: fitsOnePage ? 'calc(297mm - 1px)' : '297mm',
              borderTop:
                pageTarget === 2
                  ? '1px dashed rgba(100, 116, 139, 0.55)'
                  : fitsOnePage
                  ? '1px dashed rgba(148, 163, 184, 0.4)'
                  : '1.5px dashed rgba(245, 158, 11, 0.75)',
            }}
          >
            <span
              className={`-mt-4 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${
                pageTarget === 2
                  ? 'bg-slate-100/95 text-slate-600 border border-slate-300'
                  : fitsOnePage
                  ? 'bg-slate-100/90 text-slate-400 border border-slate-200/80'
                  : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}
            >
              {pageTarget === 2 ? 'Page 1 / Page 2 Break' : 'Page 1 A4 Boundary (297mm)'}
            </span>
          </div>

          {/* Optional Page 2 A4 Boundary Guide when 2-Page target is active and content reaches Page 2 */}
          {pageTarget === 2 && !fitsOnePage && (
            <div
              aria-hidden="true"
              className="page-break-guide no-print print:hidden pointer-events-none absolute left-0 right-0 flex items-center justify-end pr-2"
              style={{
                top: fitsTarget ? 'calc(594mm - 1px)' : '594mm',
                borderTop: fitsTarget
                  ? '1px dashed rgba(148, 163, 184, 0.4)'
                  : '1.5px dashed rgba(245, 158, 11, 0.75)',
              }}
            >
              <span
                className={`-mt-4 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${
                  fitsTarget
                    ? 'bg-slate-100/90 text-slate-500 border border-slate-200/80'
                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}
              >
                Page 2 A4 Boundary (594mm)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
