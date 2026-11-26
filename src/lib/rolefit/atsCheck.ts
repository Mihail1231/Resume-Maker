import { ResumeData } from '@/types/resume';

export interface WeakVerbSuggestion {
  verb: string;
  rewrittenBullet: string;
}

export interface WeakBulletFlag {
  id: string;
  targetType: 'experience' | 'project';
  entryId: string;
  entryTitle: string;
  bulletIndex: number;
  originalText: string;
  weakPhrase: string;
  suggestions: WeakVerbSuggestion[];
}

export type DensityStatus = 'light' | 'optimal' | 'dense';

export interface AtsCheckResult {
  totalBullets: number;
  quantifiedBullets: number;
  quantifiedPercent: number;
  weakBullets: WeakBulletFlag[];
  totalWords: number;
  densityStatus: DensityStatus;
  densityLabel: string;
  densityHint: string;
}

interface WeakRule {
  pattern: RegExp;
  label: string;
  verbs: string[];
  /**
   * Transform the rest of the bullet cleanly after the matched weak starter phrase
   * so the 1-click replacement reads naturally without awkward grammar.
   */
  rewrite: (verb: string, match: RegExpMatchArray, fullText: string) => string;
}

function capitalizeFirst(str: string): string {
  const trimmed = str.trimStart();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Strip a leading auxiliary verb or gerund cleanly where appropriate.
 */
const WEAK_STARTER_RULES: WeakRule[] = [
  {
    // "Responsible for updating weekly inventory..." or "Was responsible for managing..."
    pattern: /^(?:was\s+)?responsible\s+for\s+(?:[a-z]+ing\s+)?/i,
    label: 'Responsible for',
    verbs: ['Streamlined', 'Managed', 'Automated'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Helped conduct user research..." or "Helped to build..." or "Helped with..."
    pattern: /^helped\s+(?:to\s+|with\s+)?(?:(?:conduct|build|create|design|develop|manage|run|organize|analyze|prepare|write|update|maintain|implement|launch|test|improve|lead|coordinate|support)\s+)?/i,
    label: 'Helped',
    verbs: ['Spearheaded', 'Led', 'Co-led'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Worked on a campus course-planner..." or "Worked with..."
    pattern: /^worked\s+(?:on|with)\s+/i,
    label: 'Worked on',
    verbs: ['Engineered', 'Built', 'Developed'],
    rewrite: (verb, match, fullText) => {
      const matchedLower = match[0].toLowerCase();
      const rest = fullText.slice(match[0].length).trimStart();
      if (matchedLower.includes('with')) {
        const collabVerb =
          verb === 'Engineered'
            ? 'Partnered with'
            : verb === 'Built'
            ? 'Collaborated with'
            : 'Aligned with';
        return rest ? `${collabVerb} ${rest}` : collabVerb;
      }
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Assisted with..." / "Assisted in..."
    pattern: /^assisted\s+(?:with|in)\s+(?:[a-z]+ing\s+)?/i,
    label: 'Assisted with',
    verbs: ['Accelerated', 'Supported', 'Delivered'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Participated in..."
    pattern: /^participated\s+in\s+/i,
    label: 'Participated in',
    verbs: ['Contributed to', 'Drove', 'Collaborated in'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Handled..."
    pattern: /^handled\s+/i,
    label: 'Handled',
    verbs: ['Executed', 'Orchestrated', 'Resolved'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
  {
    // "Duties included..." / "Tasked with..."
    pattern: /^(?:duties\s+included|was\s+tasked\s+with|tasked\s+with)\s+(?:[a-z]+ing\s+)?/i,
    label: 'Duties included',
    verbs: ['Delivered', 'Executed', 'Owned'],
    rewrite: (verb, match, fullText) => {
      const rest = fullText.slice(match[0].length).trimStart();
      return rest ? `${verb} ${rest}` : verb;
    },
  },
];

/**
 * Detect whether a bullet contains meaningful quantification:
 * percentages (25%, [X%]), currencies ($10K, CHF 4.2M, EUR 2M, €500K), ratios/GPAs (5.40/6.0, 110/120),
 * ranges (20-50), multipliers (2x), and counts (40+, 150,000, 300 days, 3 halls).
 * Excludes standalone 4-digit calendar years (1990–2039).
 */
export function isBulletQuantified(bullet: string): boolean {
  const text = bullet.trim();
  if (!text) return false;

  // Placeholder metrics like [X%], [N+], [$X], [CHF/EUR XM] also indicate quantified structure
  if (/\[\s*(?:\$|€|CHF|EUR|CHF\/EUR)?\s*[xnm]\s*[%+xMmKk]?\s*\]/i.test(text)) return true;
  if (
    /(?:\$|€|£|CHF\s*|EUR\s*)[\d,.]+[KkMmBb]?|\d+(?:\.\d+)?%|\b\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?\b|\b\d+(?:[.,']\d{3})*\+|\b\d+(?:\.\d+)?x\b/i.test(
      text
    )
  ) {
    return true;
  }

  // Check remaining numbers (including Swiss/EU thousands separators 150'000 / 150,000 and ranges 20-50)
  // while ignoring standalone years (1990–2039)
  const numbers = text.match(/\b\d+(?:[,'’]\d{3})*(?:\.\d+)?\b/g) || [];
  return numbers.some((numStr) => {
    const clean = numStr.replace(/[,’']/g, '');
    const n = Number(clean);
    if (clean.length === 4 && n >= 1990 && n <= 2039) return false;
    return !Number.isNaN(n);
  });
}

function countResumeWords(resume: ResumeData): number {
  const chunks: string[] = [
    resume.personalInfo.fullName,
    resume.personalInfo.jobTitle,
    resume.summary,
    ...resume.skills,
    ...resume.languages,
    ...resume.certifications,
    ...resume.workExperience.flatMap((e) => [e.company, e.position, e.location, ...e.description]),
    ...resume.projects.flatMap((p) => [p.name, p.role, ...p.technologies, ...p.description]),
    ...resume.education.flatMap((ed) => [ed.school, ed.degree, ed.description]),
  ];

  const joined = chunks.filter(Boolean).join(' ').trim();
  if (!joined) return 0;
  return joined.split(/\s+/).length;
}

export function runAtsQuickCheck(resume: ResumeData): AtsCheckResult {
  const allBullets: Array<{
    targetType: 'experience' | 'project';
    entryId: string;
    entryTitle: string;
    bulletIndex: number;
    text: string;
  }> = [];

  for (const exp of resume.workExperience) {
    const entryTitle = exp.position || exp.company || 'Work Experience';
    exp.description.forEach((raw, idx) => {
      const text = raw.trim();
      if (text) {
        allBullets.push({
          targetType: 'experience',
          entryId: exp.id,
          entryTitle,
          bulletIndex: idx,
          text,
        });
      }
    });
  }

  for (const proj of resume.projects) {
    const entryTitle = proj.name || 'Project';
    proj.description.forEach((raw, idx) => {
      const text = raw.trim();
      if (text) {
        allBullets.push({
          targetType: 'project',
          entryId: proj.id,
          entryTitle,
          bulletIndex: idx,
          text,
        });
      }
    });
  }

  let quantifiedBullets = 0;
  const weakBullets: WeakBulletFlag[] = [];

  for (const item of allBullets) {
    if (isBulletQuantified(item.text)) {
      quantifiedBullets += 1;
    }

    for (const rule of WEAK_STARTER_RULES) {
      const match = item.text.match(rule.pattern);
      if (match) {
        const matchedPhrase = match[0].trim();
        const suggestions: WeakVerbSuggestion[] = rule.verbs.map((verb) => {
          const rewritten = capitalizeFirst(rule.rewrite(verb, match, item.text));
          // Show clean button label matching what gets applied (e.g. "Partnered with" if "Worked with")
          const buttonLabel =
            rule.label === 'Worked on' && match[0].toLowerCase().includes('with')
              ? verb === 'Engineered'
                ? 'Partnered with'
                : verb === 'Built'
                ? 'Collaborated with'
                : 'Aligned with'
              : verb;
          return {
            verb: buttonLabel,
            rewrittenBullet: rewritten,
          };
        });

        weakBullets.push({
          id: `${item.targetType}-${item.entryId}-${item.bulletIndex}`,
          targetType: item.targetType,
          entryId: item.entryId,
          entryTitle: item.entryTitle,
          bulletIndex: item.bulletIndex,
          originalText: item.text,
          weakPhrase: matchedPhrase,
          suggestions,
        });
        break;
      }
    }
  }

  const totalBullets = allBullets.length;
  const quantifiedPercent =
    totalBullets > 0 ? Math.round((quantifiedBullets / totalBullets) * 100) : 0;

  const totalWords = countResumeWords(resume);

  let densityStatus: DensityStatus;
  let densityLabel: string;
  let densityHint: string;

  if (totalWords < 180 || totalBullets < 4) {
    densityStatus = 'light';
    densityLabel = 'Light Content';
    densityHint = 'Add 4–10 quantified bullets across Experience & Projects to fill 1 page.';
  } else if (totalWords <= 520 && totalBullets <= 14) {
    densityStatus = 'optimal';
    densityLabel = 'Ideal 1-Page Fit';
    densityHint = 'Well-balanced density for a clean, single-page student internship resume.';
  } else {
    densityStatus = 'dense';
    densityLabel = 'Getting Dense';
    densityHint = 'Consider trimming older bullets or using Compact spacing to stay on 1 page.';
  }

  return {
    totalBullets,
    quantifiedBullets,
    quantifiedPercent,
    weakBullets,
    totalWords,
    densityStatus,
    densityLabel,
    densityHint,
  };
}
