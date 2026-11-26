'use client';

import React, { useMemo, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import {
  PRESET_INTERNSHIP_JDS,
  PresetJD,
  PresetTrackGroup,
} from '@/lib/rolefit/demoData';
import { RoleFitAnalysis } from '@/lib/rolefit/analyzer';
import { CATEGORY_LABELS, SkillCategory } from '@/lib/rolefit/dictionary';
import { getBulletTemplatesForKeyword } from '@/lib/rolefit/bulletTemplates';
import { runAtsQuickCheck, WeakBulletFlag } from '@/lib/rolefit/atsCheck';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Code2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSearch,
  Target,
  Check,
  Plus,
  Info,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  FileText,
  Upload,
  Compass,
  Landmark,
  TrendingUp,
  Rocket,
  Building2,
} from 'lucide-react';

interface RoleFitPanelProps {
  jdText: string;
  onJdChange: (value: string) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: PresetJD) => void;
  onClearJd: () => void;
  analysis: RoleFitAnalysis;
  onJumpToEditor?: (section: 'experience' | 'projects' | 'skills') => void;
  onOpenCvImport?: () => void;
}

interface ActiveDrawerKeyword {
  keyword: string;
  category: SkillCategory | 'domain';
}

interface TargetEntryOption {
  key: string;
  type: 'experience' | 'project';
  id: string;
  label: string;
}

function getScoreTheme(score: number) {
  if (score >= 75) {
    return {
      label: 'Strong RoleFit',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      barBg: 'bg-emerald-500',
      strokeColor: '#10b981',
    };
  }
  if (score >= 50) {
    return {
      label: 'Getting Closer',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      barBg: 'bg-amber-500',
      strokeColor: '#f59e0b',
    };
  }
  return {
    label: 'Needs Tailoring',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    barBg: 'bg-rose-500',
    strokeColor: '#f43f5e',
  };
}

function getTrackIcon(track: PresetJD['roleTrack']) {
  switch (track) {
    case 'consulting':
      return Compass;
    case 'finance':
      return Landmark;
    case 'vc':
      return TrendingUp;
    case 'gtm':
      return Rocket;
    case 'pm':
      return Briefcase;
    case 'swe':
      return Code2;
    case 'data':
      return BarChart3;
  }
}

/**
 * Highlight [bracketed placeholders] inside bullet template previews so students
 * immediately see what to replace with authentic metrics and projects.
 */
function renderHighlightedBullet(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, idx) =>
    part.startsWith('[') && part.endsWith(']') ? (
      <span
        key={idx}
        className="px-1 py-0.5 rounded bg-amber-500/15 text-amber-200 font-medium"
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

export default function RoleFitPanel({
  jdText,
  onJdChange,
  activePresetId,
  onSelectPreset,
  onClearJd,
  analysis,
  onJumpToEditor,
  onOpenCvImport,
}: RoleFitPanelProps) {
  const {
    resumeData,
    loadStudentSampleData,
    loadBusinessSampleData,
    addSkillTag,
    appendBulletToEntry,
    replaceBulletText,
  } = useResume();

  const [loadedSampleLabel, setLoadedSampleLabel] = useState<string | null>(null);
  const [selectedTrackGroup, setSelectedTrackGroup] = useState<PresetTrackGroup | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerKeyword | null>(null);
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>('');
  const [insertedTemplateIds, setInsertedTemplateIds] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);

  const activePresetTrackGroup: PresetTrackGroup = useMemo(() => {
    if (selectedTrackGroup) return selectedTrackGroup;
    const match = PRESET_INTERNSHIP_JDS.find((p) => p.id === activePresetId);
    return match ? match.trackGroup : 'business';
  }, [selectedTrackGroup, activePresetId]);

  const visiblePresets = useMemo(
    () => PRESET_INTERNSHIP_JDS.filter((p) => p.trackGroup === activePresetTrackGroup),
    [activePresetTrackGroup]
  );

  const isResumeEmpty =
    !resumeData.personalInfo.fullName &&
    !resumeData.summary &&
    resumeData.workExperience.length === 0 &&
    resumeData.projects.length === 0 &&
    resumeData.skills.length === 0;

  const targetEntries = useMemo<TargetEntryOption[]>(() => {
    const expOptions: TargetEntryOption[] = resumeData.workExperience.map((exp, idx) => ({
      key: `experience:${exp.id}`,
      type: 'experience',
      id: exp.id,
      label: `Experience · ${exp.position || `Role ${idx + 1}`}${
        exp.company ? ` @ ${exp.company}` : ''
      }`,
    }));
    const projOptions: TargetEntryOption[] = resumeData.projects.map((proj, idx) => ({
      key: `project:${proj.id}`,
      type: 'project',
      id: proj.id,
      label: `Project · ${proj.name || `Project ${idx + 1}`}`,
    }));
    return [...expOptions, ...projOptions];
  }, [resumeData.workExperience, resumeData.projects]);

  const effectiveTarget = useMemo(() => {
    if (targetEntries.length === 0) return null;
    return targetEntries.find((t) => t.key === selectedTargetKey) || targetEntries[0];
  }, [targetEntries, selectedTargetKey]);

  const atsCheck = useMemo(() => runAtsQuickCheck(resumeData), [resumeData]);

  const drawerTemplates = useMemo(() => {
    if (!activeDrawer) return [];
    return getBulletTemplatesForKeyword(activeDrawer.keyword, activeDrawer.category);
  }, [activeDrawer]);

  const showToast = (message: string) => {
    setActionToast(message);
    window.setTimeout(() => {
      setActionToast((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  const handleLoadStudentSample = () => {
    loadStudentSampleData();
    setActiveDrawer(null);
    setInsertedTemplateIds({});
    setLoadedSampleLabel('Maya Lin');
    window.setTimeout(() => {
      setLoadedSampleLabel((prev) => (prev === 'Maya Lin' ? null : prev));
    }, 2500);
  };

  const handleLoadBusinessSample = () => {
    loadBusinessSampleData();
    setActiveDrawer(null);
    setInsertedTemplateIds({});
    setLoadedSampleLabel('Lukas Weber');
    window.setTimeout(() => {
      setLoadedSampleLabel((prev) => (prev === 'Lukas Weber' ? null : prev));
    }, 2500);
  };

  const handleMissingPillClick = (keyword: string, category: SkillCategory | 'domain') => {
    if (activeDrawer?.keyword === keyword) {
      setActiveDrawer(null);
      return;
    }
    setActiveDrawer({ keyword, category });
    setInsertedTemplateIds({});
  };

  const handleAddSkillFromDrawer = (keyword: string) => {
    addSkillTag(keyword);
    showToast(`Added "${keyword}" to Skills — RoleFit score updated!`);
  };

  const handleInsertBullet = (templateId: string, bulletText: string) => {
    if (!effectiveTarget) return;
    appendBulletToEntry(effectiveTarget.type, effectiveTarget.id, bulletText);
    setInsertedTemplateIds((prev) => ({ ...prev, [templateId]: true }));
    showToast(`Inserted bullet into ${effectiveTarget.label.replace(/^(Experience|Project) · /, '')}`);
  };

  const handleSwapWeakVerb = (flag: WeakBulletFlag, verb: string, rewrittenBullet: string) => {
    replaceBulletText(flag.targetType, flag.entryId, flag.bulletIndex, rewrittenBullet);
    showToast(`Upgraded starter verb to "${verb}"`);
  };

  const isDrawerKeywordInSkills = activeDrawer
    ? resumeData.skills.some(
        (s) => s.trim().toLowerCase() === activeDrawer.keyword.toLowerCase()
      )
    : false;

  const wordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;
  const scoreTheme = getScoreTheme(analysis.score);

  // SVG Ring dimensions
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, analysis.score)) / 100) * circumference;

  const skillsNeededFor75 =
    analysis.totalKeywords > 0
      ? Math.max(0, Math.ceil(analysis.totalKeywords * 0.75) - analysis.matchedCount)
      : 0;

  const densityBadgeClass =
    atsCheck.densityStatus === 'optimal'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : atsCheck.densityStatus === 'light'
      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  const quantifiedBarClass =
    atsCheck.quantifiedPercent >= 60
      ? 'bg-emerald-500'
      : atsCheck.quantifiedPercent >= 35
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="space-y-4 print:hidden no-print">
      {/* Live Action Confirmation Toast */}
      {actionToast && (
        <div
          role="status"
          className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 text-xs font-medium flex items-center justify-between gap-2 animate-fade-in-up print:hidden no-print"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionToast}</span>
          </span>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-emerald-300/70 hover:text-emerald-100 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Demo Bar */}
      <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Quick Demo Mode
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onOpenCvImport && (
              <button
                type="button"
                onClick={onOpenCvImport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-accent/15 text-accent border border-accent/35 hover:bg-accent/25 transition-colors cursor-pointer print:hidden no-print"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CV (PDF / DOCX)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleLoadBusinessSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/35 hover:bg-indigo-500/25 transition-colors cursor-pointer"
              title="Load fictional HSG Business Innovation student resume (Lukas Weber)"
            >
              {loadedSampleLabel === 'Lukas Weber' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Loaded Lukas</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>HSG Sample</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleLoadStudentSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer"
              title="Load Tech & CS student sample resume (Maya Lin)"
            >
              {loadedSampleLabel === 'Maya Lin' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Loaded Maya</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Tech Sample</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Role Track Category Tabs */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-text-muted">Target Role Presets:</span>
            <div
              role="tablist"
              aria-label="Preset target role categories"
              className="inline-flex p-0.5 rounded-lg bg-surface border border-border print:hidden no-print"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activePresetTrackGroup === 'business'}
                onClick={() => setSelectedTrackGroup('business')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activePresetTrackGroup === 'business'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Business &amp; Finance (HSG)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activePresetTrackGroup === 'tech'}
                onClick={() => setSelectedTrackGroup('tech')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activePresetTrackGroup === 'tech'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Tech &amp; Product
              </button>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-2 ${
              activePresetTrackGroup === 'business' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
            }`}
          >
            {visiblePresets.map((preset) => {
              const Icon = getTrackIcon(preset.roleTrack);
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    setActiveDrawer(null);
                  }}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/15 border-primary text-text-primary shadow-sm'
                      : 'bg-surface/70 border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive ? 'text-primary-light' : 'text-text-muted'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {preset.shortLabel}
                    </div>
                    <div className="text-[10px] text-text-muted truncate mt-0.5">
                      {preset.company}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Description Paste Area */}
      <div className="p-4 rounded-xl bg-surface-light border border-border space-y-2.5 print:hidden no-print">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="rolefit-jd-textarea"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary"
          >
            <FileSearch className="w-4 h-4 text-primary-light" />
            <span>Target Job Description</span>
          </label>
          <div className="flex items-center gap-2.5 text-[11px] text-text-muted">
            <span>
              {wordCount} {wordCount === 1 ? 'word' : 'words'} &middot; {jdText.length} chars
            </span>
            {jdText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearJd();
                  setActiveDrawer(null);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border text-text-secondary hover:text-danger hover:border-danger/40 transition-colors cursor-pointer"
                title="Clear job description"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          id="rolefit-jd-textarea"
          value={jdText}
          onChange={(e) => onJdChange(e.target.value)}
          placeholder="Paste any internship or entry-level job description here to analyze keyword match in real time (100% local in your browser)..."
          rows={5}
          className="input-field min-h-[128px] max-h-[260px] resize-y text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span>100% local matching &middot; Zero data leaves your browser</span>
          <span className="text-emerald-400/80">Auto-saved locally</span>
        </div>
      </div>

      {/* Empty Resume Gentle Prompt */}
      {isResumeEmpty && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-3 print:hidden no-print">
          <p className="text-xs text-text-secondary leading-relaxed">
            Your resume is currently blank. Load the student sample resume or switch to{' '}
            <span className="font-semibold text-text-primary">Edit Resume</span> to enter your details.
          </p>
          <button
            type="button"
            onClick={handleLoadStudentSample}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Load Sample
          </button>
        </div>
      )}

      {/* Live RoleFit Score & Keyword Analysis */}
      {!analysis.hasJD ? (
        <div className="p-6 rounded-xl bg-surface-light/60 border border-dashed border-border text-center space-y-2 print:hidden no-print">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Target className="w-5 h-5 text-primary-light" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            Paste a Job Description to Calculate Your RoleFit Score
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Pick one of the preset job descriptions above or paste any role description. RoleFit
            instantly normalizes synonyms and lets you insert tailored impact bullets in 1 click.
          </p>
        </div>
      ) : analysis.totalKeywords === 0 ? (
        <div className="p-5 rounded-xl bg-surface-light border border-border text-center space-y-1.5 print:hidden no-print">
          <p className="text-xs font-semibold text-text-primary">
            No recognizable technical or role skills detected yet
          </p>
          <p className="text-xs text-text-muted">
            Paste the full Qualifications or Responsibilities section of the job posting for an
            accurate RoleFit score.
          </p>
        </div>
      ) : (
        <>
          {/* Live Score Card */}
          <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
            <div className="flex items-center gap-4">
              {/* Circular Score Ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={scoreTheme.strokeColor}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-extrabold leading-none ${scoreTheme.textColor}`}>
                    {analysis.score}%
                  </span>
                </div>
              </div>

              {/* Score Details & Progress Bar */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-text-primary">RoleFit Match Score</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scoreTheme.badgeBg}`}
                  >
                    {scoreTheme.label}
                  </span>
                </div>

                <p className="text-xs text-text-secondary">
                  <span className="font-bold text-text-primary">{analysis.matchedCount}</span> /{' '}
                  <span className="font-bold text-text-primary">{analysis.totalKeywords}</span> key
                  skills matched
                  {skillsNeededFor75 > 0 && (
                    <span className="text-text-muted">
                      {' '}
                      &middot; Add {skillsNeededFor75} more to hit 75%+
                    </span>
                  )}
                </p>

                <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${scoreTheme.barBg}`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Missing Keywords (Clickable Amber Pills) + Inline Action Drawer */}
          <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Missing Keywords ({analysis.missingCount})
                </h4>
              </div>
              <span className="text-[11px] text-amber-300/80">
                Click any skill to add or insert a bullet
              </span>
            </div>

            {analysis.missingKeywords.length === 0 ? (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Every detected job description keyword is covered in your resume!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((item) => {
                  const categoryName =
                    item.category === 'domain'
                      ? 'Role Domain Term'
                      : CATEGORY_LABELS[item.category as SkillCategory];
                  const isSelected = activeDrawer?.keyword === item.keyword;
                  return (
                    <button
                      key={item.keyword}
                      type="button"
                      onClick={() => handleMissingPillClick(item.keyword, item.category)}
                      title={`Click to add "${item.keyword}" • ${categoryName} • Mentioned ${item.jdMentions}x in Job Description`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/25 text-amber-100 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/60'
                      }`}
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>{item.keyword}</span>
                      {item.jdMentions > 1 && (
                        <span className="text-[10px] font-bold px-1 rounded bg-amber-500/20 text-amber-200">
                          {item.jdMentions}&times;
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Inline 1-Click Skill & XYZ Impact-Bullet Inserter Drawer */}
            {activeDrawer && (
              <div className="mt-3 p-3.5 rounded-xl bg-surface border border-amber-500/40 space-y-3.5 shadow-lg print:hidden no-print">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-primary">
                        Tailor for &ldquo;{activeDrawer.keyword}&rdquo;
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-light text-text-secondary border border-border">
                        {activeDrawer.category === 'domain'
                          ? 'Role Term'
                          : CATEGORY_LABELS[activeDrawer.category as SkillCategory]}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Add directly to your Skills section or insert a student-ready XYZ bullet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors cursor-pointer"
                    aria-label="Close keyword drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action 1: 1-Click Add to Skills */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-surface-light/70 border border-border">
                  <div className="text-xs text-text-secondary">
                    Quickly list <span className="font-semibold text-text-primary">{activeDrawer.keyword}</span> in your Technical Skills
                  </div>
                  <button
                    type="button"
                    disabled={isDrawerKeywordInSkills}
                    onClick={() => handleAddSkillFromDrawer(activeDrawer.keyword)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isDrawerKeywordInSkills
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25 cursor-pointer'
                    }`}
                  >
                    {isDrawerKeywordInSkills ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Skills</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Skills</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action 2: Target Entry Picker + XYZ / STAR Bullet Templates */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label
                      htmlFor="rolefit-target-entry"
                      className="text-[11px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      Insert XYZ / STAR Bullet Into:
                    </label>
                    {targetEntries.length > 0 && effectiveTarget && (
                      <select
                        id="rolefit-target-entry"
                        value={effectiveTarget.key}
                        onChange={(e) => {
                          setSelectedTargetKey(e.target.value);
                          setInsertedTemplateIds({});
                        }}
                        className="input-field py-1.5 px-2.5 text-xs sm:max-w-[260px]"
                      >
                        {targetEntries.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {targetEntries.length === 0 ? (
                    <div className="p-3 rounded-lg bg-surface-light/60 border border-dashed border-border text-xs text-text-secondary flex items-center justify-between gap-2">
                      <span>Add a Work Experience or Project entry first to insert bullets.</span>
                      {onJumpToEditor && (
                        <button
                          type="button"
                          onClick={() => onJumpToEditor('experience')}
                          className="shrink-0 text-primary-light hover:underline font-semibold cursor-pointer"
                        >
                          Open Editor &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {drawerTemplates.map((tpl) => {
                        const isInserted = Boolean(insertedTemplateIds[tpl.id]);
                        return (
                          <div
                            key={tpl.id}
                            className="p-3 rounded-lg bg-surface-light/60 border border-border hover:border-border-light transition-colors space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary-light">
                                {tpl.tag}
                              </span>
                              <button
                                type="button"
                                disabled={isInserted}
                                onClick={() => handleInsertBullet(tpl.id, tpl.text)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                                  isInserted
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                                    : 'bg-primary/15 text-primary-light border-primary/35 hover:bg-primary/25 cursor-pointer'
                                }`}
                              >
                                {isInserted ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Inserted</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Insert Bullet</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {renderHighlightedBullet(tpl.text)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ethical Placeholder Reminder */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200/90">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Replace <code className="font-mono text-amber-100">[bracketed placeholders]</code>{' '}
                      with your real projects and metrics before exporting.
                    </span>
                  </div>
                  {onJumpToEditor && effectiveTarget && (
                    <button
                      type="button"
                      onClick={() =>
                        onJumpToEditor(
                          effectiveTarget.type === 'experience' ? 'experience' : 'projects'
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-100 underline cursor-pointer"
                    >
                      <span>Customize in Editor</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Matched Keywords (Green Pills with Section Location Tags) */}
          <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Matched Keywords ({analysis.matchedCount})
                </h4>
              </div>
              <span className="text-[11px] text-text-muted">Found in your resume</span>
            </div>

            {analysis.matchedKeywords.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                No job description skills matched yet — load a sample resume or click a missing
                keyword above to see your score update live.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedKeywords.map((item) => {
                  const visibleLocations = item.locations.slice(0, 2);
                  const extraCount = item.locations.length - visibleLocations.length;
                  return (
                    <span
                      key={item.keyword}
                      title={`Matched in: ${item.locations.join(', ')} • Mentioned ${item.jdMentions}x in Job Description`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    >
                      <Check className="w-3 h-3 shrink-0 text-emerald-400" />
                      <span>{item.keyword}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-200/90">
                        {visibleLocations.join(', ')}
                        {extraCount > 0 ? ` +${extraCount}` : ''}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ATS Quick Check Card */}
      <div className="p-4 rounded-xl bg-surface-light border border-border space-y-4 print:hidden no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              ATS Quick Check
            </h4>
          </div>
          <span
            title={atsCheck.densityHint}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${densityBadgeClass}`}
          >
            <FileText className="w-3 h-3" />
            <span>{atsCheck.densityLabel}</span>
            <span className="opacity-75">
              &middot; ~{atsCheck.totalWords}w / {atsCheck.totalBullets} bullets
            </span>
          </span>
        </div>

        {/* Quantified Impact Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Quantified Impact Bullets</span>
            <span className="font-bold text-text-primary">
              {atsCheck.quantifiedBullets} / {atsCheck.totalBullets} bullets quantified
              {atsCheck.totalBullets > 0 && (
                <span className="text-text-muted font-normal"> ({atsCheck.quantifiedPercent}%)</span>
              )}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${quantifiedBarClass}`}
              style={{ width: `${atsCheck.quantifiedPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted">
            Counts Experience &amp; Project bullets containing measurable numbers, %, $, or +.
          </p>
        </div>

        {/* Weak Starter Verbs Detector */}
        <div className="border-t border-border/60 pt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Weak Starter Verbs ({atsCheck.weakBullets.length})</span>
            </div>
            {atsCheck.weakBullets.length > 0 && (
              <span className="text-[11px] text-text-muted">1-click upgrade</span>
            )}
          </div>

          {atsCheck.totalBullets === 0 ? (
            <p className="text-xs text-text-muted italic">
              Add Experience or Project bullets (or load the Student Sample) to run verb &amp; metric
              checks.
            </p>
          ) : atsCheck.weakBullets.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>All {atsCheck.totalBullets} bullets start with strong action verbs!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {atsCheck.weakBullets.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-lg bg-surface/80 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                      {flag.targetType === 'experience' ? 'Experience' : 'Project'} &middot;{' '}
                      {flag.entryTitle}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                      Weak opener
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="underline decoration-rose-400 decoration-wavy underline-offset-2 text-rose-300 font-semibold">
                      {flag.weakPhrase}
                    </span>
                    {flag.originalText.slice(flag.weakPhrase.length)}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-text-muted mr-0.5">Swap with:</span>
                    {flag.suggestions.map((suggestion) => (
                      <button
                        key={suggestion.verb}
                        type="button"
                        onClick={() =>
                          handleSwapWeakVerb(flag, suggestion.verb, suggestion.rewrittenBullet)
                        }
                        title={`Replace bullet with: "${suggestion.rewrittenBullet}"`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <span>{suggestion.verb}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1-Page Density Guidance */}
        <p className="text-[11px] text-text-muted border-t border-border/60 pt-2.5">
          <span className="font-semibold text-text-secondary">1-Page Check:</span>{' '}
          {atsCheck.densityHint}
        </p>
      </div>
    </div>
  );
}
