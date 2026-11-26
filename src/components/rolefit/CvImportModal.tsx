'use client';

import React, { useRef, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { extractTextFromCvFile, CvExtractionError } from '@/lib/rolefit/fileExtractors';
import { parseCvText, ParsedCvResult } from '@/lib/rolefit/cvParser';
import { ResumeData } from '@/types/resume';
import {
  Upload,
  FileText,
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardPaste,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  User,
  Mail,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface CvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (result: ParsedCvResult) => void;
}

export default function CvImportModal({ isOpen, onClose, onApplied }: CvImportModalProps) {
  const { resumeData, importParsedResume } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScannedError, setIsScannedError] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedCvResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  if (!isOpen) return null;

  const preserveStyle = {
    themeColor: resumeData.themeColor,
    fontFamily: resumeData.fontFamily,
    spacing: resumeData.spacing,
    template: resumeData.template,
    sectionOrder: resumeData.sectionOrder,
  };

  const resetModalState = () => {
    setErrorMessage(null);
    setIsScannedError(false);
    setParsedResult(null);
    setSourceLabel('');
    setShowRawText(false);
    setIsExtracting(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsScannedError(false);
    setIsExtracting(true);
    setParsedResult(null);

    try {
      const extracted = await extractTextFromCvFile(file);
      const parsed = parseCvText(extracted.text, preserveStyle);
      const pageSuffix =
        extracted.pageCount && extracted.pageCount > 1
          ? ` (${extracted.pageCount} pages)`
          : extracted.pageCount === 1
          ? ' (1 page)'
          : '';
      setSourceLabel(`${file.name}${pageSuffix}`);
      setParsedResult(parsed);
    } catch (err) {
      if (err instanceof CvExtractionError) {
        setErrorMessage(err.message);
        setIsScannedError(err.code === 'SCANNED_PDF' || err.code === 'EMPTY_DOCUMENT');
      } else {
        setErrorMessage(
          'Unable to parse this file. Please try another PDF/DOCX or paste your CV text manually.'
        );
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleParsePastedText = () => {
    const trimmed = pastedText.trim();
    if (trimmed.length < 30) {
      setErrorMessage('Please paste at least a few lines of your CV text to parse.');
      return;
    }
    setErrorMessage(null);
    setIsScannedError(false);
    const parsed = parseCvText(trimmed, preserveStyle);
    setSourceLabel('Pasted CV Text');
    setParsedResult(parsed);
  };

  const handleApply = () => {
    if (!parsedResult) return;
    const dataToApply: ResumeData = parsedResult.resumeData;
    importParsedResume(dataToApply);
    onApplied?.(parsedResult);
    resetModalState();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden no-print"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-surface-light border border-border shadow-2xl overflow-hidden print:hidden no-print">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-surface/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Upload className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 id="cv-import-modal-title" className="text-base font-bold text-text-primary">
                Upload Existing CV (PDF / DOCX)
              </h2>
              <p className="text-xs text-text-muted">
                Auto-fill your resume sections locally, then tailor to any internship JD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Banner */}
        <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
          <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>Processed locally in your browser — your CV never leaves your device</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!parsedResult ? (
            <>
              {/* Input Mode Tabs */}
              <div
                role="tablist"
                aria-label="CV import method"
                className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-border"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'upload'}
                  onClick={() => {
                    setActiveTab('upload');
                    setErrorMessage(null);
                    setIsScannedError(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF / DOCX</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'paste'}
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMessage(null);
                    setIsScannedError(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste CV Text</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                  {isScannedError && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('paste');
                        setErrorMessage(null);
                        setIsScannedError(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-rose-400/40 text-rose-200 hover:text-white font-semibold cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Switch to Paste CV Text</span>
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'upload' ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !isExtracting && fileInputRef.current?.click()}
                  className={`p-8 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer space-y-3 ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/60 hover:bg-surface/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Choose PDF or DOCX resume file"
                  />

                  {isExtracting ? (
                    <div className="py-4 space-y-3">
                      <Loader2 className="w-9 h-9 text-primary-light animate-spin mx-auto" />
                      <p className="text-sm font-semibold text-text-primary">
                        Extracting and parsing your CV locally...
                      </p>
                      <p className="text-xs text-text-muted">
                        Reconstructing lines, sections, bullets, and skills in your browser
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6 text-primary-light" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-primary">
                          Drag &amp; drop your CV here, or click to browse
                        </p>
                        <p className="text-xs text-text-muted">
                          Supports text-based <span className="font-semibold text-text-secondary">.PDF</span> and{' '}
                          <span className="font-semibold text-text-secondary">.DOCX</span> files up to 10 MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="btn btn-primary text-xs px-5 py-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose PDF or DOCX File</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cv-paste-textarea" className="input-label">
                      Paste Full Resume / CV Text
                    </label>
                    <textarea
                      id="cv-paste-textarea"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      rows={9}
                      placeholder="Paste your existing resume text here (Name, Email, Experience, Projects, Education, Skills)..."
                      className="input-field min-h-[200px] resize-y text-xs leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-text-muted">
                      Great fallback for multi-column PDFs or Canva exports
                    </span>
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      className="btn btn-primary text-xs px-5 py-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse CV Text</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Import Preview Step */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Parsed {sourceLabel} — Review detected fields before applying</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedResult(null);
                    setShowRawText(false);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Compact Detection Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <User className="w-4 h-4 text-primary-light shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Full Name
                    </div>
                    <div className="text-xs font-bold text-text-primary truncate">
                      {parsedResult.resumeData.personalInfo.fullName || 'Not detected'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-light shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Email &amp; Contact
                    </div>
                    <div className="text-xs font-bold text-text-primary truncate">
                      {parsedResult.resumeData.personalInfo.email || 'Not detected'}
                      {parsedResult.report.linksDetected > 0 && (
                        <span className="text-text-muted font-normal">
                          {' '}
                          &middot; {parsedResult.report.linksDetected}{' '}
                          {parsedResult.report.linksDetected === 1 ? 'link' : 'links'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Experience Entries
                    </div>
                    <div className="text-xs font-bold text-text-primary">
                      {parsedResult.report.experienceCount}{' '}
                      {parsedResult.report.experienceCount === 1 ? 'role' : 'roles'}{' '}
                      <span className="text-text-muted font-normal">
                        ({parsedResult.report.experienceBulletsCount} bullets)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Projects
                    </div>
                    <div className="text-xs font-bold text-text-primary">
                      {parsedResult.report.projectCount}{' '}
                      {parsedResult.report.projectCount === 1 ? 'project' : 'projects'}{' '}
                      <span className="text-text-muted font-normal">
                        ({parsedResult.report.projectBulletsCount} bullets)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-violet-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Education
                    </div>
                    <div className="text-xs font-bold text-text-primary">
                      {parsedResult.report.educationCount}{' '}
                      {parsedResult.report.educationCount === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                      Skills Detected
                    </div>
                    <div className="text-xs font-bold text-text-primary">
                      {parsedResult.report.skillsCount} skills matched
                      {parsedResult.report.languagesCount > 0 && (
                        <span className="text-text-muted font-normal">
                          {' '}
                          &middot; {parsedResult.report.languagesCount} languages
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview of Top Detected Skills */}
              {parsedResult.resumeData.skills.length > 0 && (
                <div className="p-3 rounded-xl bg-surface/70 border border-border space-y-2">
                  <div className="text-[11px] font-semibold text-text-secondary">
                    Detected Skills Preview:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.resumeData.skills.slice(0, 14).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary-light border border-primary/25"
                      >
                        {skill}
                      </span>
                    ))}
                    {parsedResult.resumeData.skills.length > 14 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] text-text-muted">
                        +{parsedResult.resumeData.skills.length - 14} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Parser Warnings */}
              {parsedResult.report.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Quick Heads-Up</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/90 space-y-0.5">
                    {parsedResult.report.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expandable Raw Extracted Text */}
              <div className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowRawText((v) => !v)}
                  className="w-full px-3.5 py-2.5 bg-surface flex items-center justify-between text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <span>View Raw Extracted Text ({parsedResult.report.rawText.length} chars)</span>
                  {showRawText ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showRawText && (
                  <pre className="p-3.5 max-h-48 overflow-auto bg-surface/50 text-[11px] text-text-secondary font-mono whitespace-pre-wrap border-t border-border">
                    {parsedResult.report.rawText}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost text-xs px-4 py-2"
          >
            Cancel
          </button>
          {parsedResult && (
            <button
              type="button"
              onClick={handleApply}
              className="btn btn-success text-xs px-5 py-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Resume</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
