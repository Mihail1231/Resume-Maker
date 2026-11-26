'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import PersonalInfoForm from '@/components/editor/PersonalInfoForm';
import ExperienceForm from '@/components/editor/ExperienceForm';
import EducationForm from '@/components/editor/EducationForm';
import ProjectsForm from '@/components/editor/ProjectsForm';
import SkillsForm from '@/components/editor/SkillsForm';
import ResumePreview from '@/components/preview/ResumePreview';
import RoleFitPanel from '@/components/rolefit/RoleFitPanel';
import CvImportModal from '@/components/rolefit/CvImportModal';
import { ParsedCvResult } from '@/lib/rolefit/cvParser';
import { SectionId, SpacingOption } from '@/types/resume';
import {
  analyzeRoleFit,
  ROLEFIT_JD_STORAGE_KEY,
  ROLEFIT_PRESET_STORAGE_KEY,
} from '@/lib/rolefit/analyzer';
import { PresetJD } from '@/lib/rolefit/demoData';
import {
  FileText,
  Sparkles,
  Download,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Palette,
  ArrowLeft,
  GripVertical,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

const COLORS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#475569' },
  { name: 'Teal', value: '#0d9488' },
];

const FONTS = [
  'Inter',
  'Outfit',
  'Plus Jakarta Sans',
  'Lora',
  'Playfair Display',
  'Merriweather',
  'Roboto Mono',
];

function BuilderWorkspace() {
  const {
    resumeData,
    setTemplate,
    setThemeColor,
    setFontFamily,
    setSpacing,
    updateSectionOrder,
    moveSection,
    loadSampleData,
    resetData,
    exportJSON,
    importJSON,
  } = useResume();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIndex) || fromIndex === toIndex) return;

    const order = [...(resumeData.sectionOrder || ['summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications'])];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    updateSectionOrder(order);
  };

  const isSectionActive = (id: string) => {
    switch (id) {
      case 'summary': return !!resumeData.summary;
      case 'experience': return resumeData.workExperience.length > 0;
      case 'projects': return resumeData.projects.length > 0;
      case 'education': return resumeData.education.length > 0;
      case 'skills': return resumeData.skills.length > 0;
      case 'languages': return resumeData.languages.length > 0;
      case 'certifications': return resumeData.certifications.length > 0;
      default: return false;
    }
  };

  const SECTION_NAMES: Record<string, string> = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    projects: 'Key Projects',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications',
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Left-panel workspace mode & RoleFit JD state
  const [workspaceMode, setWorkspaceMode] = useState<'edit' | 'tailor'>('edit');
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const jdHydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'tailor') {
          setWorkspaceMode('tailor');
        }
        if (params.get('import') === 'true') {
          setIsCvModalOpen(true);
          setWorkspaceMode('tailor');
        }

        const savedJd = localStorage.getItem(ROLEFIT_JD_STORAGE_KEY);
        if (savedJd !== null) {
          setJdText(savedJd);
        }
        const savedPreset = localStorage.getItem(ROLEFIT_PRESET_STORAGE_KEY);
        if (savedPreset) {
          setActivePresetId(savedPreset);
        }
      } catch {
        // ignore storage errors
      }
      jdHydratedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!jdHydratedRef.current) return;
    try {
      localStorage.setItem(ROLEFIT_JD_STORAGE_KEY, jdText);
      if (activePresetId) {
        localStorage.setItem(ROLEFIT_PRESET_STORAGE_KEY, activePresetId);
      } else {
        localStorage.removeItem(ROLEFIT_PRESET_STORAGE_KEY);
      }
    } catch {
      // ignore storage quota errors
    }
  }, [jdText, activePresetId]);

  const roleFitAnalysis = useMemo(
    () => analyzeRoleFit(resumeData, jdText),
    [resumeData, jdText]
  );

  const handleJdChange = (value: string) => {
    setJdText(value);
    setActivePresetId(null);
  };

  const handleSelectPreset = (preset: PresetJD) => {
    setJdText(preset.description);
    setActivePresetId(preset.id);
  };

  const handleClearJd = () => {
    setJdText('');
    setActivePresetId(null);
  };

  const handleJumpToEditor = (section: 'experience' | 'projects' | 'skills') => {
    setWorkspaceMode('edit');
    setOpenSections((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleCvApplied = (result: ParsedCvResult) => {
    const { experienceCount, projectCount, skillsCount } = result.report;
    const summaryMsg = `Imported CV: ${experienceCount} exp, ${projectCount} proj, ${skillsCount} skills — ready to tailor!`;
    setImportToast(summaryMsg);
    window.setTimeout(() => {
      setImportToast((prev) => (prev === summaryMsg ? null : prev));
    }, 4000);
  };

  const scorePillClass =
    roleFitAnalysis.score >= 75
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : roleFitAnalysis.score >= 50
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    styling: true,
    personal: true,
    experience: false,
    education: false,
    projects: false,
    skills: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importJSON(file);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-text-primary">
      {/* Header Toolbar */}
      <header className="h-16 border-b border-border bg-surface-light fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between no-print print:hidden glass">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            title="Back to Landing Page"
            aria-label="Back to landing page"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold tracking-tight hidden sm:inline">
              RoleFit <span className="text-primary-light">Tailor</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCvModalOpen(true)}
            className="btn text-xs px-3 py-2 flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/35 hover:bg-accent/25 print:hidden no-print"
            title="Upload an existing PDF or DOCX CV to auto-fill your resume"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CV</span>
          </button>

          <button
            onClick={loadSampleData}
            className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
            title="Load template placeholder data to see how it works"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span className="hidden md:inline">Demo Data</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
            title="Import from JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Import JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={exportJSON}
            className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
            title="Export as backup JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Backup JSON</span>
          </button>

          <button
            onClick={resetData}
            className="btn btn-danger text-xs px-3 py-2 flex items-center gap-1.5"
            title="Reset/Clear form data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clear All</span>
          </button>

          <button
            onClick={triggerPrint}
            className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            title="Print or Save as PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 pt-16 flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel: Form Editors & RoleFit Tailor */}
        <div className="w-full lg:w-[45%] border-r border-border bg-surface-light/40 overflow-y-auto p-6 space-y-4 no-print print:hidden editor-panel">
          {/* Segmented Mode Toggle */}
          <div
            role="tablist"
            aria-label="Builder workspace mode"
            className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-border print:hidden no-print"
          >
            <button
              type="button"
              role="tab"
              aria-selected={workspaceMode === 'edit'}
              onClick={() => setWorkspaceMode('edit')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceMode === 'edit'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit Resume</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={workspaceMode === 'tailor'}
              onClick={() => setWorkspaceMode('tailor')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceMode === 'tailor'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>RoleFit Tailor</span>
              {roleFitAnalysis.hasJD && roleFitAnalysis.totalKeywords > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    workspaceMode === 'tailor'
                      ? 'bg-white/20 text-white border-white/30'
                      : scorePillClass
                  }`}
                >
                  {roleFitAnalysis.score}%
                </span>
              )}
            </button>
          </div>

          {importToast && (
            <div
              role="status"
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 text-xs font-medium flex items-center justify-between gap-2 print:hidden no-print"
            >
              <span>{importToast}</span>
              <button
                type="button"
                onClick={() => setImportToast(null)}
                className="text-emerald-300/70 hover:text-emerald-100 text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {workspaceMode === 'tailor' ? (
            <RoleFitPanel
              jdText={jdText}
              onJdChange={handleJdChange}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              onClearJd={handleClearJd}
              analysis={roleFitAnalysis}
              onJumpToEditor={handleJumpToEditor}
              onOpenCvImport={() => setIsCvModalOpen(true)}
            />
          ) : (
            <>
              {/* Section 1: Styling & Template Controls */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('styling')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <Palette className="w-4 h-4 text-primary-light" />
                <span>1. Customize Design & Layout</span>
              </div>
              {openSections.styling ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.styling && (
              <div className="editor-section-content space-y-4 border-t border-border/40 pt-4">
                {/* Templates Selection */}
                <div>
                  <label className="input-label">Select Layout Design</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['modern', 'executive', 'minimalist'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all ${
                          resumeData.template === t
                            ? 'bg-primary/10 border-primary text-primary-light'
                            : 'bg-surface border-border text-text-secondary hover:border-border-light'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Colors */}
                <div>
                  <label className="input-label">Accent Color Theme</label>
                  <div className="flex flex-wrap gap-2.5">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setThemeColor(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                          resumeData.themeColor === c.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                        aria-label={`Select ${c.name} accent`}
                      />
                    ))}
                    {/* Custom Hex Color Picker */}
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border">
                      <input
                        type="color"
                        value={resumeData.themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="absolute inset-0 cursor-pointer w-full h-full scale-150"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>

                {/* Fonts & Spacing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Typography Style</label>
                    <select
                      value={resumeData.fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="input-field"
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Line & Item Spacing</label>
                    <select
                      value={resumeData.spacing}
                      onChange={(e) => setSpacing(e.target.value as SpacingOption)}
                      className="input-field"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>

                {/* Section Reordering */}
                <div className="border-t border-border/40 pt-4">
                  <label className="input-label mb-2 flex items-center justify-between">
                    <span>Section Display Order</span>
                    <span className="text-[10px] text-text-muted">Drag or use arrows</span>
                  </label>
                  
                  <div className="space-y-2">
                    {(resumeData.sectionOrder || ['summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications']).map((id, index, arr) => {
                      const active = isSectionActive(id);
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, index)}
                          className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border hover:border-border-light transition-all cursor-grab active:cursor-grabbing group"
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                            <span className="text-xs font-semibold text-text-primary">
                              {SECTION_NAMES[id]}
                            </span>
                            <span 
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                              title={active ? 'Active (shows on resume)' : 'Empty (hidden from resume)'} 
                            />
                            <span className="text-[9px] text-text-muted hidden sm:inline">
                              {active ? 'Active' : 'Empty'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => moveSection(id as SectionId, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-surface-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(id as SectionId, 'down')}
                              disabled={index === arr.length - 1}
                              className="p-1 rounded hover:bg-surface-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Personal Information */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('personal')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <User className="w-4 h-4 text-primary-light" />
                <span>2. Personal Info & Summary</span>
              </div>
              {openSections.personal ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.personal && (
              <div className="editor-section-content border-t border-border/40 pt-4">
                <PersonalInfoForm />
              </div>
            )}
          </div>

          {/* Section 3: Work Experience */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('experience')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <Briefcase className="w-4 h-4 text-primary-light" />
                <span>3. Work Experience ({resumeData.workExperience.length})</span>
              </div>
              {openSections.experience ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.experience && (
              <div className="editor-section-content border-t border-border/40 pt-4">
                <ExperienceForm />
              </div>
            )}
          </div>

          {/* Section 4: Projects */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('projects')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <FolderGit2 className="w-4 h-4 text-primary-light" />
                <span>4. Projects ({resumeData.projects.length})</span>
              </div>
              {openSections.projects ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.projects && (
              <div className="editor-section-content border-t border-border/40 pt-4">
                <ProjectsForm />
              </div>
            )}
          </div>

          {/* Section 5: Education */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('education')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <GraduationCap className="w-4 h-4 text-primary-light" />
                <span>5. Education ({resumeData.education.length})</span>
              </div>
              {openSections.education ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.education && (
              <div className="editor-section-content border-t border-border/40 pt-4">
                <EducationForm />
              </div>
            )}
          </div>

          {/* Section 6: Skills & Tags */}
          <div className="editor-section">
            <div
              onClick={() => toggleSection('skills')}
              className="editor-section-header"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-text-primary">
                <Wrench className="w-4 h-4 text-primary-light" />
                <span>6. Skills, Languages & Certifications</span>
              </div>
              {openSections.skills ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {openSections.skills && (
              <div className="editor-section-content border-t border-border/40 pt-4">
                <SkillsForm />
              </div>
            )}
          </div>
            </>
          )}

          {/* Subtle MIT Attribution Footer */}
          <footer className="pt-4 pb-2 text-center text-[11px] text-text-muted border-t border-border/50 print:hidden no-print">
            Built on Resume-Maker (MIT) &bull; Tailored with RoleFit
          </footer>
        </div>

        {/* Right Panel: Live PDF Preview */}
        <div className="w-full lg:w-[55%] flex flex-col bg-surface overflow-hidden">
          <ResumePreview />
        </div>
      </div>

      {/* Client-Side CV Upload Modal (PDF / DOCX / Paste) */}
      <CvImportModal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        onApplied={handleCvApplied}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <BuilderWorkspace />
    </ResumeProvider>
  );
}
