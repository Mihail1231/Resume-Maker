'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { PRESET_INTERNSHIP_JDS, PresetJD } from '@/lib/rolefit/demoData';
import { RoleFitAnalysis } from '@/lib/rolefit/analyzer';
import { CATEGORY_LABELS, SkillCategory } from '@/lib/rolefit/dictionary';
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
} from 'lucide-react';

interface RoleFitPanelProps {
  jdText: string;
  onJdChange: (value: string) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: PresetJD) => void;
  onClearJd: () => void;
  analysis: RoleFitAnalysis;
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
    case 'pm':
      return Briefcase;
    case 'swe':
      return Code2;
    case 'data':
      return BarChart3;
  }
}

export default function RoleFitPanel({
  jdText,
  onJdChange,
  activePresetId,
  onSelectPreset,
  onClearJd,
  analysis,
}: RoleFitPanelProps) {
  const { resumeData, loadStudentSampleData } = useResume();
  const [studentLoadedFeedback, setStudentLoadedFeedback] = useState(false);

  const isResumeEmpty =
    !resumeData.personalInfo.fullName &&
    !resumeData.summary &&
    resumeData.workExperience.length === 0 &&
    resumeData.projects.length === 0 &&
    resumeData.skills.length === 0;

  const handleLoadStudentSample = () => {
    loadStudentSampleData();
    setStudentLoadedFeedback(true);
    window.setTimeout(() => setStudentLoadedFeedback(false), 2500);
  };

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

  return (
    <div className="space-y-4 print:hidden no-print">
      {/* Quick Demo Bar */}
      <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Quick Demo Mode
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadStudentSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer"
          >
            {studentLoadedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Loaded Maya Lin</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Load Student Sample Resume</span>
              </>
            )}
          </button>
        </div>

        <div>
          <p className="text-[11px] text-text-muted mb-2">
            Try a sample internship job description:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_INTERNSHIP_JDS.map((preset) => {
              const Icon = getTrackIcon(preset.roleTrack);
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
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
                onClick={onClearJd}
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
          rows={6}
          className="input-field min-h-[140px] max-h-[280px] resize-y text-xs leading-relaxed"
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
            Pick one of the 3 internship presets above or paste any role description. RoleFit
            instantly normalizes synonyms (e.g. JS/JavaScript, PM/Product Management) and highlights
            your matched and missing skills.
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

          {/* Missing Keywords (Amber Pills) */}
          <div className="p-4 rounded-xl bg-surface-light border border-border space-y-3 print:hidden no-print">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Missing Keywords ({analysis.missingCount})
                </h4>
              </div>
              <span className="text-[11px] text-text-muted">Sorted by JD priority</span>
            </div>

            {analysis.missingKeywords.length === 0 ? (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Every detected JD keyword is covered in your resume!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((item) => {
                  const categoryName =
                    item.category === 'domain'
                      ? 'JD Domain Term'
                      : CATEGORY_LABELS[item.category as SkillCategory];
                  return (
                    <span
                      key={item.keyword}
                      title={`${categoryName} • Mentioned ${item.jdMentions}x in JD`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                    >
                      <span>{item.keyword}</span>
                      {item.jdMentions > 1 && (
                        <span className="text-[10px] font-bold px-1 rounded bg-amber-500/20 text-amber-200">
                          {item.jdMentions}&times;
                        </span>
                      )}
                    </span>
                  );
                })}
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
                No JD skills matched yet — load the student sample or add matching skills to see
                your score update live.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedKeywords.map((item) => {
                  const visibleLocations = item.locations.slice(0, 2);
                  const extraCount = item.locations.length - visibleLocations.length;
                  return (
                    <span
                      key={item.keyword}
                      title={`Matched in: ${item.locations.join(', ')} • Mentioned ${item.jdMentions}x in JD`}
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
    </div>
  );
}
