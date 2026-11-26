import { ResumeData } from '@/types/resume';
import { SKILL_DICTIONARY, SkillCategory, SkillEntry } from './dictionary';

export type MatchLocation =
  | 'Summary'
  | 'Skills'
  | 'Experience'
  | 'Projects'
  | 'Education'
  | 'Certifications';

export interface MatchedKeyword {
  keyword: string;
  category: SkillCategory | 'domain';
  jdMentions: number;
  locations: MatchLocation[];
  isCustomTerm?: boolean;
}

export interface MissingKeyword {
  keyword: string;
  category: SkillCategory | 'domain';
  jdMentions: number;
  priorityScore: number;
  isCustomTerm?: boolean;
}

export interface RoleFitAnalysis {
  score: number;
  totalKeywords: number;
  matchedCount: number;
  missingCount: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  hasJD: boolean;
}

export const ROLEFIT_JD_STORAGE_KEY = 'rolefit_jd_text';
export const ROLEFIT_PRESET_STORAGE_KEY = 'rolefit_jd_preset';

interface CompiledSkill {
  entry: SkillEntry;
  insensitivePattern: RegExp | null;
  sensitivePattern: RegExp | null;
  allNormalizedTerms: Set<string>;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCombinedBoundaryRegex(terms: string[], caseSensitive: boolean): RegExp | null {
  if (terms.length === 0) return null;
  // Sort longest-first so compound aliases (e.g. "b2b saas") match before shorter ones ("saas")
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const alternation = sorted.map((t) => escapeRegExp(t.trim())).join('|');
  const flags = caseSensitive ? 'g' : 'gi';
  // Exclude hyphen (-) from boundary chars so "Go" never matches inside "Go-To-Market"
  return new RegExp(`(?:^|[^a-zA-Z0-9_+#-])(?:${alternation})(?=$|[^a-zA-Z0-9_+#-])`, flags);
}

const COMPILED_SKILLS: CompiledSkill[] = SKILL_DICTIONARY.map((entry) => {
  const uniqueInsensitive = Array.from(
    new Set(entry.aliases.map((a) => a.trim().toLowerCase()).filter(Boolean))
  );
  const uniqueSensitive = Array.from(
    new Set((entry.caseSensitiveAliases || []).map((a) => a.trim()).filter(Boolean))
  );

  const allNormalizedTerms = new Set<string>([
    entry.canonical.toLowerCase(),
    ...uniqueInsensitive,
    ...uniqueSensitive.map((s) => s.toLowerCase()),
  ]);

  return {
    entry,
    insensitivePattern: buildCombinedBoundaryRegex(uniqueInsensitive, false),
    sensitivePattern: buildCombinedBoundaryRegex(uniqueSensitive, true),
    allNormalizedTerms,
  };
});

function countMatches(text: string, compiled: CompiledSkill): number {
  if (!text) return 0;
  let total = 0;

  if (compiled.insensitivePattern) {
    compiled.insensitivePattern.lastIndex = 0;
    const matches = text.match(compiled.insensitivePattern);
    if (matches) total += matches.length;
  }

  if (compiled.sensitivePattern) {
    compiled.sensitivePattern.lastIndex = 0;
    const matches = text.match(compiled.sensitivePattern);
    if (matches) total += matches.length;
  }

  return total;
}

function hasMatch(text: string, compiled: CompiledSkill): boolean {
  if (!text) return false;

  if (compiled.insensitivePattern) {
    compiled.insensitivePattern.lastIndex = 0;
    if (compiled.insensitivePattern.test(text)) return true;
  }

  if (compiled.sensitivePattern) {
    compiled.sensitivePattern.lastIndex = 0;
    if (compiled.sensitivePattern.test(text)) return true;
  }

  return false;
}

/**
 * Strip URLs and emails so domain names or handles never cause accidental acronym matches.
 */
function stripLinksAndEmails(text: string): string {
  return text
    .replace(/\bhttps?:\/\/\S+/gi, ' ')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, ' ')
    .replace(/\b(?:www\.|linkedin\.com\/|github\.com\/)\S+/gi, ' ')
    .replace(/\b[a-z0-9-]+\.(?:dev|app|io|com|org|edu|net)\b/gi, ' ');
}

const JD_STOPWORDS = new Set([
  'about', 'above', 'across', 'after', 'again', 'against', 'all', 'also', 'alongside',
  'among', 'and', 'any', 'are', 'around', 'assist', 'available', 'back', 'backed', 'based',
  'basic', 'being', 'below', 'between', 'bonus', 'both', 'build', 'building', 'business',
  'but', 'can', 'candidate', 'candidates', 'clear', 'closely', 'collaborate', 'collaborating',
  'company', 'complex', 'contribute', 'core', 'create', 'creating', 'current', 'currently',
  'data', 'day', 'degree', 'design', 'develop', 'developer', 'developing', 'development',
  'different', 'drive', 'during', 'each', 'early', 'education', 'engineering', 'engineer',
  'ensure', 'environment', 'equal', 'equivalent', 'every', 'excellent', 'executive',
  'experience', 'experienced', 'exposure', 'fast', 'field', 'familiarity', 'focus', 'for',
  'foundation', 'frameworks', 'from', 'full', 'get', 'global', 'good', 'great', 'growth',
  'hands', 'have', 'help', 'helping', 'high', 'hybrid', 'ideal', 'impact', 'improve',
  'improving', 'implement', 'including', 'insights', 'intern', 'internship', 'into', 'join',
  'key', 'knowledge', 'large', 'least', 'level', 'like', 'looking', 'maintain', 'maintainable',
  'make', 'making', 'manage', 'managing', 'managers', 'measure', 'modern', 'monitor', 'more',
  'most', 'multi', 'must', 'new', 'next', 'not', 'one', 'online', 'operations', 'opportunity',
  'other', 'our', 'out', 'over', 'own', 'part', 'participate', 'partner', 'passion',
  'passionate', 'people', 'perform', 'performance', 'platform', 'plus', 'position', 'preferred',
  'prepare', 'problem', 'process', 'product', 'products', 'program', 'project', 'projects',
  'pursuing', 'qualifications', 'quality', 'real', 'recommendations', 'related', 'reliable',
  'remote', 'required', 'requirements', 'responsibilities', 'responsible', 'results', 'retail',
  'role', 'scripts', 'seeking', 'services', 'set', 'share', 'should', 'skills', 'software',
  'solutions', 'some', 'stack', 'strong', 'structured', 'student', 'students', 'summer',
  'support', 'system', 'systems', 'team', 'teams', 'technical', 'technologies', 'technology',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'thorough',
  'thousands', 'through', 'time', 'tools', 'top', 'track', 'transform', 'translating',
  'undergraduate', 'understanding', 'upcoming', 'usage', 'use', 'used', 'user', 'users',
  'using', 'validate', 'various', 'very', 'want', 'web', 'weekly', 'well', 'what', 'when',
  'where', 'which', 'while', 'who', 'will', 'with', 'within', 'without', 'work', 'working',
  'workflows', 'world', 'write', 'writing', 'written', 'year', 'years', 'you', 'your',
  'actionable', 'analytical', 'clean', 'commercial', 'concepts', 'customer', 'datasets',
  'decisions', 'deliver', 'delivery', 'economics', 'efficient', 'features', 'gaps',
  'interactive', 'interfaces', 'launch', 'million', 'obsessed', 'planning', 'regional',
  'revenue', 'scalable', 'science', 'statistics', 'stories', 'trends', 'uncover', 'updates',
  'verbal', 'computer', 'bachelor', 'masters', 'major', 'spring', 'fall', 'winter',
  '2025', '2026', '2027', '2028',
]);

/**
 * Extract up to 4 high-frequency domain terms from arbitrary JDs that aren't already
 * represented by canonical skills in SKILL_DICTIONARY (e.g., "FinTech", "Shopify", "Stripe").
 */
function extractFallbackDomainTerms(
  jdText: string,
  alreadyMatchedNormalized: Set<string>,
  minCount: number
): Array<{ term: string; count: number }> {
  // Ignore tokens appearing on explicit "Company:" / "Location:" header lines
  const headerNoise = new Set<string>();
  const companyLines = jdText.match(/^(?:company|organization|location)\s*:\s*.+$/gim) || [];
  for (const line of companyLines) {
    const lineTokens = line.match(/\b[A-Za-z][A-Za-z0-9]{2,}\b/g) || [];
    for (const t of lineTokens) headerNoise.add(t.toLowerCase());
  }

  const cleaned = stripLinksAndEmails(jdText);
  const tokens = cleaned.match(/\b[A-Za-z][A-Za-z0-9+#.-]{2,}\b/g) || [];
  const counts = new Map<string, { display: string; count: number; capitalized: boolean }>();

  for (const raw of tokens) {
    const lower = raw.toLowerCase().replace(/[.-]+$/g, '');
    if (lower.length < 3 || lower.length > 26) continue;
    if (JD_STOPWORDS.has(lower) || headerNoise.has(lower)) continue;
    if (alreadyMatchedNormalized.has(lower)) continue;
    if (/^\d+$/.test(lower)) continue;

    // Skip single words that are substrings of an already matched multi-word skill
    let subsumed = false;
    for (const existing of alreadyMatchedNormalized) {
      if (existing.includes(' ') && existing.split(/\s+/).includes(lower)) {
        subsumed = true;
        break;
      }
    }
    if (subsumed) continue;

    const isCapitalized = /^[A-Z]/.test(raw);
    const prev = counts.get(lower);
    if (prev) {
      prev.count += 1;
      if (isCapitalized && !prev.capitalized) {
        prev.display = raw.replace(/[.-]+$/g, '');
        prev.capitalized = true;
      }
    } else {
      counts.set(lower, {
        display: isCapitalized
          ? raw.replace(/[.-]+$/g, '')
          : lower.charAt(0).toUpperCase() + lower.slice(1),
        count: 1,
        capitalized: isCapitalized,
      });
    }
  }

  return Array.from(counts.values())
    .filter((item) => item.count >= minCount)
    .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
    .slice(0, 4)
    .map((item) => ({ term: item.display, count: item.count }));
}

function buildResumeSectionBuckets(resume: ResumeData): Record<MatchLocation, string> {
  const summaryText = stripLinksAndEmails(
    [resume.personalInfo.jobTitle, resume.summary].filter(Boolean).join(' ')
  );

  const skillsText = stripLinksAndEmails(resume.skills.join(' , '));

  const experienceText = stripLinksAndEmails(
    resume.workExperience
      .map((exp) => [exp.position, exp.company, ...exp.description].filter(Boolean).join(' '))
      .join(' ')
  );

  const projectsText = stripLinksAndEmails(
    resume.projects
      .map((proj) =>
        [proj.name, proj.role, ...proj.technologies, ...proj.description].filter(Boolean).join(' ')
      )
      .join(' ')
  );

  const educationText = stripLinksAndEmails(
    resume.education
      .map((edu) => [edu.degree, edu.school, edu.description].filter(Boolean).join(' '))
      .join(' ')
  );

  const certificationsText = stripLinksAndEmails(resume.certifications.join(' , '));

  return {
    Summary: summaryText,
    Skills: skillsText,
    Experience: experienceText,
    Projects: projectsText,
    Education: educationText,
    Certifications: certificationsText,
  };
}

/**
 * Check if a keyword appears in the "Qualifications" / "Requirements" half of the JD
 * to prioritize core must-have skills near the top of Missing Keywords.
 */
function getQualificationsBoost(jdText: string, compiled: CompiledSkill): number {
  const qualIndex = jdText.search(/\b(qualifications|requirements|must have|what you bring)\b/i);
  if (qualIndex === -1) return 0;
  const qualSection = jdText.slice(qualIndex);
  return hasMatch(qualSection, compiled) ? 2 : 0;
}

/**
 * Extract all canonical skill names from SKILL_DICTIONARY found anywhere in a block of text.
 * Used by cvParser.ts to ensure relevant technical & domain skills are not missed.
 */
export function extractDictionarySkillsFromText(text: string): string[] {
  const cleaned = stripLinksAndEmails(text);
  if (!cleaned.trim()) return [];
  const matched: string[] = [];
  for (const compiled of COMPILED_SKILLS) {
    if (hasMatch(cleaned, compiled)) {
      matched.push(compiled.entry.canonical);
    }
  }
  return matched;
}

export function analyzeRoleFit(resume: ResumeData, jdText: string): RoleFitAnalysis {
  const trimmedJD = jdText.trim();
  if (!trimmedJD) {
    return {
      score: 0,
      totalKeywords: 0,
      matchedCount: 0,
      missingCount: 0,
      matchedKeywords: [],
      missingKeywords: [],
      hasJD: false,
    };
  }

  const cleanedJD = stripLinksAndEmails(trimmedJD);
  const buckets = buildResumeSectionBuckets(resume);
  const locationsOrder: MatchLocation[] = [
    'Skills',
    'Experience',
    'Projects',
    'Summary',
    'Education',
    'Certifications',
  ];

  const matchedKeywords: MatchedKeyword[] = [];
  const missingKeywords: MissingKeyword[] = [];
  const coveredTerms = new Set<string>();

  // 1. Scan curated dictionary skills against JD & Resume
  for (const compiled of COMPILED_SKILLS) {
    const jdMentions = countMatches(cleanedJD, compiled);
    if (jdMentions === 0) continue;

    for (const term of compiled.allNormalizedTerms) {
      coveredTerms.add(term);
    }

    const foundLocations: MatchLocation[] = [];
    for (const loc of locationsOrder) {
      if (hasMatch(buckets[loc], compiled)) {
        foundLocations.push(loc);
      }
    }

    if (foundLocations.length > 0) {
      matchedKeywords.push({
        keyword: compiled.entry.canonical,
        category: compiled.entry.category,
        jdMentions,
        locations: foundLocations,
      });
    } else {
      const qualBoost = getQualificationsBoost(cleanedJD, compiled);
      missingKeywords.push({
        keyword: compiled.entry.canonical,
        category: compiled.entry.category,
        jdMentions,
        priorityScore: jdMentions * 2 + qualBoost + 5, // Dictionary skills prioritized over fallback terms
      });
    }
  }

  // 2. Supplement with high-frequency domain terms from custom pasted JDs
  const dictionaryMatchCount = matchedKeywords.length + missingKeywords.length;
  const fallbackMinCount = dictionaryMatchCount >= 12 ? 3 : 2;
  const fallbackTerms = extractFallbackDomainTerms(cleanedJD, coveredTerms, fallbackMinCount);
  for (const { term, count } of fallbackTerms) {
    const termRegex = buildCombinedBoundaryRegex([term], false);
    if (!termRegex) continue;
    const foundLocations: MatchLocation[] = [];

    for (const loc of locationsOrder) {
      termRegex.lastIndex = 0;
      if (termRegex.test(buckets[loc])) {
        foundLocations.push(loc);
      }
    }

    if (foundLocations.length > 0) {
      matchedKeywords.push({
        keyword: term,
        category: 'domain',
        jdMentions: count,
        locations: foundLocations,
        isCustomTerm: true,
      });
    } else {
      missingKeywords.push({
        keyword: term,
        category: 'domain',
        jdMentions: count,
        priorityScore: count,
        isCustomTerm: true,
      });
    }
  }

  // Sort matched by mentions desc, then alpha
  matchedKeywords.sort(
    (a, b) =>
      b.jdMentions - a.jdMentions ||
      Number(Boolean(a.isCustomTerm)) - Number(Boolean(b.isCustomTerm)) ||
      a.keyword.localeCompare(b.keyword)
  );

  // Sort missing by relevance/priority desc, then alpha
  missingKeywords.sort(
    (a, b) =>
      b.priorityScore - a.priorityScore ||
      b.jdMentions - a.jdMentions ||
      a.keyword.localeCompare(b.keyword)
  );

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const score = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;

  return {
    score,
    totalKeywords,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length,
    matchedKeywords,
    missingKeywords,
    hasJD: true,
  };
}
