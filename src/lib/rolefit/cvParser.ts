import {
  DEFAULT_RESUME_DATA,
  Education,
  PersonalInfo,
  Project,
  ResumeData,
  SectionId,
  WorkExperience,
} from '@/types/resume';
import { extractDictionarySkillsFromText } from './analyzer';

export interface CvImportReport {
  nameDetected: boolean;
  emailDetected: boolean;
  phoneDetected: boolean;
  linksDetected: number;
  experienceCount: number;
  experienceBulletsCount: number;
  projectCount: number;
  projectBulletsCount: number;
  educationCount: number;
  skillsCount: number;
  certificationsCount: number;
  languagesCount: number;
  hasSummary: boolean;
  detectedSections: string[];
  warnings: string[];
  rawText: string;
}

export interface ParsedCvResult {
  resumeData: ResumeData;
  report: CvImportReport;
}

type CanonicalSection =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages';

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  january: '01',
  feb: '02',
  february: '02',
  mar: '03',
  march: '03',
  apr: '04',
  april: '04',
  may: '05',
  jun: '06',
  june: '06',
  jul: '07',
  july: '07',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  dec: '12',
  december: '12',
  spring: '01',
  summer: '06',
  fall: '09',
  autumn: '09',
  winter: '01',
};

const SECTION_PATTERNS: Array<{ section: CanonicalSection; regex: RegExp }> = [
  {
    section: 'summary',
    regex: /^(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|about|career\s+objective|objective)$/i,
  },
  {
    section: 'experience',
    regex: /^(?:work\s+experience|professional\s+experience|relevant\s+experience|internship\s+experience|industry\s+experience|employment\s+history|employment|work\s+history|internships|experience|experience\s*&\s*leadership|leadership\s*&\s*experience)$/i,
  },
  {
    section: 'projects',
    regex: /^(?:key\s+projects|academic\s+projects|personal\s+projects|technical\s+projects|selected\s+projects|featured\s+projects|course\s+projects|projects|projects\s*&\s*research)$/i,
  },
  {
    section: 'education',
    regex: /^(?:education|academic\s+background|academics|education\s*&\s*coursework|academic\s+qualifications)$/i,
  },
  {
    section: 'skills',
    regex: /^(?:technical\s+skills|skills\s*&\s*technologies|skills\s*&\s*tools|skills\s*&\s*interests|skills,?\s*languages\s*&\s*certifications|core\s+competencies|technical\s+proficiencies|technologies|tools\s*&\s*technologies|skills)$/i,
  },
  {
    section: 'certifications',
    regex: /^(?:certifications|licenses\s*&\s*certifications|certificates|awards|honors\s*&\s*awards|awards\s*&\s*honors|leadership|leadership\s*&\s*activities|extracurriculars|activities|honors)$/i,
  },
  {
    section: 'languages',
    regex: /^(?:languages|spoken\s+languages)$/i,
  },
];

const ROLE_HINT_REGEX =
  /\b(?:intern|internship|engineer|developer|analyst|manager|fellow|assistant|lead|associate|consultant|designer|coordinator|researcher|director|president|founder|co-founder|architect|specialist|technician|tutor|instructor|teaching\s+assistant|ta|officer|member|contributor|scientist|strategist|planner)\b/i;

const SCHOOL_HINT_REGEX =
  /\b(?:university|college|institute|school|academy|polytechnic|univ\.|state|tech)\b/i;

const DEGREE_HINT_REGEX =
  /\b(?:b\.?s\.?|b\.?a\.?|b\.?eng\.?|b\.?tech\.?|m\.?s\.?|m\.?a\.?|m\.?b\.?a\.?|m\.?eng\.?|ph\.?d\.?|bachelor|master|associate|diploma|doctorate|undergraduate|candidate\s+for)\b/i;

const BULLET_PREFIX_REGEX = /^[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\u25CB•▪◦‣●○·*-]\s+/;

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+/i;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?/i;
const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:dev|app|io|com|org|net|edu|co|me|ai|xyz)(?:\/[^\s|,;)]*)?/gi;

const LOCATION_REGEX =
  /\b(?:[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2},\s*(?:[A-Z]{2}|UK|Canada|India|Singapore|Germany|France|Australia|Japan|Remote))\b|\bRemote\b/;

const SPOKEN_LANGUAGES_HINT =
  /\b(?:english|spanish|mandarin|chinese|french|german|japanese|korean|hindi|arabic|portuguese|italian|russian|cantonese|vietnamese|native|fluent|conversational|bilingual)\b/i;

interface ParsedDateRange {
  startDate: string;
  endDate: string;
  current: boolean;
  strippedText: string;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toTitleCaseIfAllCaps(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    return name
      .toLowerCase()
      .replace(/(?:^|[\s-])([a-z])/g, (m) => m.toUpperCase());
  }
  return name;
}

function normalizeSingleDateToken(token: string): { ym: string; isPresent: boolean } {
  const cleaned = token
    .trim()
    .replace(/^expected\s+/i, '')
    .replace(/^exp\.?\s+/i, '')
    .replace(/^class\s+of\s+/i, '')
    .replace(/\./g, '');

  if (/^(?:present|current|now|ongoing|to\s+date)$/i.test(cleaned)) {
    return { ym: '', isPresent: true };
  }

  // YYYY-MM
  const isoMatch = cleaned.match(/^((?:19|20)\d{2})-(\d{1,2})$/);
  if (isoMatch) {
    return { ym: `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}`, isPresent: false };
  }

  // MM/YYYY or MM-YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})[/-]((?:19|20)\d{2})$/);
  if (slashMatch) {
    const monthNum = Math.min(12, Math.max(1, parseInt(slashMatch[1], 10)));
    return { ym: `${slashMatch[2]}-${String(monthNum).padStart(2, '0')}`, isPresent: false };
  }

  // Month YYYY (e.g. "May 2024", "Sept 2023", "Summer 2025")
  const wordMatch = cleaned.match(/^([A-Za-z]+)\s*,?\s*((?:19|20)\d{2})$/);
  if (wordMatch) {
    const mKey = wordMatch[1].toLowerCase();
    const mm = MONTH_MAP[mKey] || '01';
    return { ym: `${wordMatch[2]}-${mm}`, isPresent: false };
  }

  // Year only (e.g. "2024")
  const yearMatch = cleaned.match(/^((?:19|20)\d{2})$/);
  if (yearMatch) {
    return { ym: `${yearMatch[1]}-01`, isPresent: false };
  }

  return { ym: '', isPresent: false };
}

function extractDateRange(line: string): ParsedDateRange | null {
  const dateAtom =
    '(?:(?:Expected|Exp\\.?|Class\\s+of)\\s+)?(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Autumn|Winter)\\.?\\s*,?\\s*(?:19|20)\\d{2}|\\d{1,2}[/-](?:19|20)\\d{2}|(?:19|20)\\d{2}-\\d{1,2}|(?:19|20)\\d{2})';
  const endAtom = `(?:Present|Current|Now|Ongoing|${dateAtom})`;

  const rangeRegex = new RegExp(`(${dateAtom})\\s*(?:–|—|-|to)\\s*(${endAtom})`, 'i');
  const rangeMatch = line.match(rangeRegex);
  if (rangeMatch) {
    const start = normalizeSingleDateToken(rangeMatch[1]);
    const end = normalizeSingleDateToken(rangeMatch[2]);
    const isExpectedFuture = /expected|exp\.?/i.test(rangeMatch[2]);
    const stripped = line
      .replace(rangeMatch[0], ' ')
      .replace(/[|,()[\]\s]+$/g, '')
      .replace(/^[|,()[\]\s]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return {
      startDate: start.ym,
      endDate: end.isPresent ? '' : end.ym,
      current: end.isPresent || isExpectedFuture,
      strippedText: stripped,
    };
  }

  // Single date like "Expected June 2027" or "May 2025"
  const singleRegex = new RegExp(`(?:Expected|Exp\\.?|Class\\s+of|Graduating)?\\s*(${dateAtom})`, 'i');
  const singleMatch = line.match(singleRegex);
  if (singleMatch) {
    const tok = normalizeSingleDateToken(singleMatch[1]);
    if (tok.ym) {
      const isExpected = /expected|exp\.?|graduating/i.test(singleMatch[0]);
      const stripped = line
        .replace(singleMatch[0], ' ')
        .replace(/[|,()[\]\s]+$/g, '')
        .replace(/^[|,()[\]\s]+/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return {
        startDate: isExpected ? '' : tok.ym,
        endDate: tok.ym,
        current: isExpected,
        strippedText: stripped,
      };
    }
  }

  return null;
}

function detectSectionHeading(
  line: string,
  currentSection: CanonicalSection | null
): { section: CanonicalSection; inlineContent?: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 72) return null;
  if (BULLET_PREFIX_REGEX.test(trimmed)) return null;

  // Check standalone heading first
  const cleanHeading = trimmed
    .replace(/^\d+\.\s*/, '')
    .replace(/^[^A-Za-z]+/, '')
    .replace(/[:\-—–|_=\s]+$/, '')
    .trim();

  if (cleanHeading.length >= 3 && cleanHeading.length <= 44) {
    for (const { section, regex } of SECTION_PATTERNS) {
      if (regex.test(cleanHeading)) {
        return { section };
      }
    }
  }

  // Check inline heading like "Technical Skills: Python, React, SQL" or "Summary: ..."
  const inlineMatch = trimmed.match(/^([A-Za-z][A-Za-z &/]{2,28}):\s+(.+)$/);
  if (inlineMatch) {
    const prefix = inlineMatch[1].trim();
    const rest = inlineMatch[2].trim();
    // Avoid treating "Languages: Python, JavaScript" inside Skills as spoken Languages
    if (/^languages$/i.test(prefix) && currentSection === 'skills' && !SPOKEN_LANGUAGES_HINT.test(rest)) {
      return null;
    }
    for (const { section, regex } of SECTION_PATTERNS) {
      if (regex.test(prefix)) {
        return { section, inlineContent: rest };
      }
    }
  }

  return null;
}

function stripBulletPrefix(line: string): string {
  return line.replace(BULLET_PREFIX_REGEX, '').trim();
}

function extractPersonalInfo(
  headerLines: string[],
  fullText: string
): { personalInfo: PersonalInfo; inlineSummary: string } {
  const headerText = headerLines.join('\n');

  const email = (headerText.match(EMAIL_REGEX) || fullText.match(EMAIL_REGEX))?.[0] || '';
  const phone = (headerText.match(PHONE_REGEX) || fullText.match(PHONE_REGEX))?.[0] || '';
  const linkedinRaw =
    (headerText.match(LINKEDIN_REGEX) || fullText.match(LINKEDIN_REGEX))?.[0] || '';
  const githubRaw =
    (headerText.match(GITHUB_REGEX) || fullText.match(GITHUB_REGEX))?.[0] || '';

  const linkedin = linkedinRaw.replace(/^https?:\/\/(?:www\.)?/i, '');
  const github = githubRaw.replace(/^https?:\/\/(?:www\.)?/i, '');

  // Find portfolio/website excluding email domain, linkedin, github
  const emailDomain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
  const candidateUrls = headerText.match(URL_REGEX) || [];
  let website = '';
  for (const rawUrl of candidateUrls) {
    const lower = rawUrl.toLowerCase();
    if (lower.includes('linkedin.com') || lower.includes('github.com')) continue;
    if (emailDomain && lower === emailDomain) continue;
    if (email && email.toLowerCase().includes(lower)) continue;
    website = rawUrl.replace(/^https?:\/\/(?:www\.)?/i, '');
    break;
  }

  // Extract location from header lines (after stripping contact tokens)
  let location = '';
  for (const line of headerLines) {
    const cleaned = line
      .replace(EMAIL_REGEX, ' ')
      .replace(PHONE_REGEX, ' ')
      .replace(LINKEDIN_REGEX, ' ')
      .replace(GITHUB_REGEX, ' ')
      .replace(URL_REGEX, ' ');
    const locMatch = cleaned.match(LOCATION_REGEX);
    if (locMatch) {
      location = locMatch[0].trim();
      break;
    }
  }

  // Identify fullName and optional jobTitle / inlineSummary from top clean non-contact lines
  let fullName = '';
  let jobTitle = '';
  let inlineSummary = '';

  const nonContactLines = headerLines
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const withoutContacts = line
        .replace(EMAIL_REGEX, '')
        .replace(PHONE_REGEX, '')
        .replace(LINKEDIN_REGEX, '')
        .replace(GITHUB_REGEX, '')
        .replace(URL_REGEX, '')
        .replace(LOCATION_REGEX, '')
        .replace(/[|•·,/()\-\s]+/g, '')
        .trim();
      return withoutContacts.length >= 2;
    });

  if (nonContactLines.length > 0) {
    const first = nonContactLines[0]
      .replace(EMAIL_REGEX, '')
      .replace(PHONE_REGEX, '')
      .replace(/[|•·]+.*$/, '')
      .trim();
    if (first.length >= 2 && first.length <= 50 && first.split(/\s+/).length <= 5) {
      fullName = toTitleCaseIfAllCaps(first);
    }
  }

  if (nonContactLines.length > 1) {
    const second = nonContactLines[1].trim();
    if (second.length <= 90 && !EMAIL_REGEX.test(second) && !PHONE_REGEX.test(second)) {
      jobTitle = second;
    } else if (second.length > 90) {
      inlineSummary = nonContactLines.slice(1).join(' ');
    }
  }

  return {
    personalInfo: {
      fullName,
      jobTitle,
      email,
      phone,
      location,
      website,
      linkedin,
      github,
    },
    inlineSummary,
  };
}

function splitRoleAndCompany(
  headerLines: string[]
): { position: string; company: string; location: string } {
  let location = '';
  const cleanedLines = headerLines
    .map((line) => {
      let next = line.trim();
      if (!location) {
        const loc = next.match(LOCATION_REGEX);
        if (loc) {
          location = loc[0].trim();
          next = next
            .replace(loc[0], ' ')
            .replace(/[|•·,\-—–\s]+$/g, '')
            .replace(/^[|•·,\-—–\s]+/g, '')
            .trim();
        }
      }
      return next;
    })
    .filter(Boolean);

  if (cleanedLines.length === 0) {
    return { position: '', company: '', location };
  }

  // Case 1: Two distinct header lines (e.g., Line 1 = Position, Line 2 = Company, or vice versa)
  if (cleanedLines.length >= 2) {
    const first = cleanedLines[0];
    const second = cleanedLines[1];
    const firstIsRole = ROLE_HINT_REGEX.test(first);
    const secondIsRole = ROLE_HINT_REGEX.test(second);

    if (secondIsRole && !firstIsRole) {
      return { position: second, company: first, location };
    }
    return { position: first, company: second, location };
  }

  // Case 2: Single header line with separator (|, —, –, " - ", " at ", ", ")
  const single = cleanedLines[0];
  const sepParts = single
    .split(/\s*(?:\||—|–|\s-\s|\s+at\s+|•)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (sepParts.length >= 2) {
    const [a, b] = sepParts;
    const aIsRole = ROLE_HINT_REGEX.test(a);
    const bIsRole = ROLE_HINT_REGEX.test(b);
    if (bIsRole && !aIsRole) {
      return { position: b, company: a, location };
    }
    return { position: a, company: b, location };
  }

  // Fallback comma split if short (e.g. "Software Engineering Intern, Acme Corp")
  if (single.includes(',')) {
    const commaParts = single.split(',').map((p) => p.trim()).filter(Boolean);
    if (commaParts.length === 2) {
      const [a, b] = commaParts;
      if (ROLE_HINT_REGEX.test(b) && !ROLE_HINT_REGEX.test(a)) {
        return { position: b, company: a, location };
      }
      return { position: a, company: b, location };
    }
  }

  return { position: single, company: '', location };
}

function parseExperienceSection(lines: string[]): WorkExperience[] {
  const entries: Array<{
    headerLines: string[];
    bullets: string[];
    startDate: string;
    endDate: string;
    current: boolean;
  }> = [];

  let currentEntry: (typeof entries)[number] | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = BULLET_PREFIX_REGEX.test(line);
    if (isBullet) {
      if (!currentEntry) {
        currentEntry = { headerLines: [], bullets: [], startDate: '', endDate: '', current: false };
        entries.push(currentEntry);
      }
      const bulletText = stripBulletPrefix(line);
      if (bulletText) currentEntry.bullets.push(bulletText);
      continue;
    }

    const dateInfo = extractDateRange(line);

    // Check if this non-bullet line is a wrapped continuation of the previous bullet
    if (currentEntry && currentEntry.bullets.length > 0 && !dateInfo) {
      const lastBullet = currentEntry.bullets[currentEntry.bullets.length - 1];
      const startsLowercase = /^[a-z]/.test(line);
      const prevIncomplete = !/[.!?]$/.test(lastBullet);
      const looksLikeNewHeader =
        line.length < 75 &&
        (line.includes('|') ||
          line.includes('—') ||
          line.includes('–') ||
          ROLE_HINT_REGEX.test(line)) &&
        !startsLowercase;

      if (startsLowercase || (prevIncomplete && !looksLikeNewHeader)) {
        currentEntry.bullets[currentEntry.bullets.length - 1] = `${lastBullet} ${line}`;
        continue;
      }
    }

    // Decide whether to start a new entry or attach a second header line to currentEntry
    const shouldStartNew =
      !currentEntry ||
      currentEntry.bullets.length > 0 ||
      (Boolean(dateInfo) && Boolean(currentEntry.startDate || currentEntry.endDate)) ||
      currentEntry.headerLines.length >= 2;

    if (shouldStartNew) {
      currentEntry = {
        headerLines: [],
        bullets: [],
        startDate: dateInfo?.startDate || '',
        endDate: dateInfo?.endDate || '',
        current: dateInfo?.current || false,
      };
      if (dateInfo?.strippedText) {
        currentEntry.headerLines.push(dateInfo.strippedText);
      } else if (!dateInfo) {
        currentEntry.headerLines.push(line);
      }
      entries.push(currentEntry);
    } else if (currentEntry) {
      if (dateInfo) {
        currentEntry.startDate = currentEntry.startDate || dateInfo.startDate;
        currentEntry.endDate = currentEntry.endDate || dateInfo.endDate;
        currentEntry.current = currentEntry.current || dateInfo.current;
        if (dateInfo.strippedText) {
          currentEntry.headerLines.push(dateInfo.strippedText);
        }
      } else {
        currentEntry.headerLines.push(line);
      }
    }
  }

  return entries
    .filter((e) => e.headerLines.length > 0 || e.bullets.length > 0)
    .map((entry, idx) => {
      const { position, company, location } = splitRoleAndCompany(entry.headerLines);
      return {
        id: `cv-exp-${idx + 1}`,
        position: position || 'Role Title',
        company: company || '',
        location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        current: entry.current,
        description: entry.bullets.length > 0 ? entry.bullets : [''],
      };
    });
}

function parseProjectsSection(lines: string[]): Project[] {
  const entries: Array<{
    headerLines: string[];
    bullets: string[];
    explicitTech: string[];
    githubLink: string;
    liveLink: string;
  }> = [];

  let currentEntry: (typeof entries)[number] | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Explicit tech line inside project (e.g. "Technologies: React, Node.js, PostgreSQL")
    const techLineMatch = line.match(/^(?:technologies|tech\s+stack|stack|tools|built\s+with)\s*:\s*(.+)$/i);
    if (techLineMatch && currentEntry) {
      const items = techLineMatch[1]
        .split(/[,|•·;/]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 32);
      currentEntry.explicitTech.push(...items);
      continue;
    }

    const isBullet = BULLET_PREFIX_REGEX.test(line);
    if (isBullet) {
      if (!currentEntry) {
        currentEntry = {
          headerLines: [],
          bullets: [],
          explicitTech: [],
          githubLink: '',
          liveLink: '',
        };
        entries.push(currentEntry);
      }
      const bulletText = stripBulletPrefix(line);
      if (bulletText) currentEntry.bullets.push(bulletText);
      continue;
    }

    // Continuation line of previous bullet
    if (currentEntry && currentEntry.bullets.length > 0) {
      const lastBullet = currentEntry.bullets[currentEntry.bullets.length - 1];
      const dateInfo = extractDateRange(line);
      const startsLowercase = /^[a-z]/.test(line);
      const prevIncomplete = !/[.!?]$/.test(lastBullet);
      const looksLikeProjectTitle =
        !startsLowercase &&
        line.length < 85 &&
        (line.includes('|') || line.includes('—') || line.includes('–') || Boolean(dateInfo));

      if (startsLowercase || (prevIncomplete && !looksLikeProjectTitle)) {
        currentEntry.bullets[currentEntry.bullets.length - 1] = `${lastBullet} ${line}`;
        continue;
      }
    }

    const shouldStartNew =
      !currentEntry || currentEntry.bullets.length > 0 || currentEntry.headerLines.length >= 2;

    if (shouldStartNew) {
      currentEntry = {
        headerLines: [],
        bullets: [],
        explicitTech: [],
        githubLink: '',
        liveLink: '',
      };
      entries.push(currentEntry);
    }

    if (currentEntry) {
      let cleaned = line;
      const ghMatch = cleaned.match(GITHUB_REGEX);
      if (ghMatch) {
        currentEntry.githubLink = ghMatch[0].replace(/^https?:\/\/(?:www\.)?/i, '');
        cleaned = cleaned.replace(ghMatch[0], ' ').trim();
      }
      const otherUrls = cleaned.match(URL_REGEX) || [];
      for (const u of otherUrls) {
        if (!u.toLowerCase().includes('github.com') && !currentEntry.liveLink) {
          currentEntry.liveLink = u.replace(/^https?:\/\/(?:www\.)?/i, '');
          cleaned = cleaned.replace(u, ' ').trim();
        }
      }
      const dateInfo = extractDateRange(cleaned);
      if (dateInfo) {
        cleaned = dateInfo.strippedText;
      }
      if (cleaned) currentEntry.headerLines.push(cleaned);
    }
  }

  return entries
    .filter((e) => e.headerLines.length > 0 || e.bullets.length > 0)
    .map((entry, idx) => {
      let name = '';
      let role = '';
      const techSet = new Map<string, string>();

      const addTech = (t: string) => {
        const trimmed = t.replace(/^#/, '').trim();
        if (!trimmed || trimmed.length > 32) return;
        const key = trimmed.toLowerCase();
        if (!techSet.has(key)) techSet.set(key, trimmed);
      };

      entry.explicitTech.forEach(addTech);

      if (entry.headerLines.length > 0) {
        const primary = entry.headerLines[0];
        const parts = primary
          .split(/\s*(?:\||—|–)\s*/)
          .map((p) => p.trim())
          .filter(Boolean);

        name = parts[0] || primary;

        for (let i = 1; i < parts.length; i++) {
          const seg = parts[i];
          if (seg.includes(',')) {
            seg.split(',').forEach(addTech);
          } else if (ROLE_HINT_REGEX.test(seg) && !role) {
            role = seg;
          } else if (extractDictionarySkillsFromText(seg).length > 0) {
            extractDictionarySkillsFromText(seg).forEach(addTech);
          } else if (!role) {
            role = seg;
          }
        }

        if (entry.headerLines.length > 1) {
          const secondary = entry.headerLines[1];
          if (secondary.includes(',')) {
            secondary.split(',').forEach(addTech);
          } else if (!role) {
            role = secondary;
          }
        }
      }

      // Supplement technologies with dictionary skills found in project bullets if needed
      if (techSet.size < 3) {
        const inferred = extractDictionarySkillsFromText(
          [name, ...entry.bullets].join(' ')
        );
        inferred.slice(0, 6).forEach(addTech);
      }

      return {
        id: `cv-proj-${idx + 1}`,
        name: name || `Project ${idx + 1}`,
        role,
        technologies: Array.from(techSet.values()).slice(0, 8),
        githubLink: entry.githubLink,
        liveLink: entry.liveLink,
        description: entry.bullets.length > 0 ? entry.bullets : [''],
      };
    });
}

function parseEducationSection(lines: string[]): Education[] {
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Skip blank lines instead of splitting unconditionally — Word DOCX files
    // extracted via mammoth emit blank lines (\n\n) between every paragraph.
    if (!line) continue;

    const isNoteLine = /^(?:relevant\s+coursework|coursework|dean'?s\s+list|honors|awards|activities|clubs|gpa|minor)\b/i.test(
      stripBulletPrefix(line)
    );
    const hasSchoolAlready = currentBlock.some(
      (l) => SCHOOL_HINT_REGEX.test(l) && !/coursework|dean/i.test(l)
    );
    const hasDegreeAlready = currentBlock.some((l) => DEGREE_HINT_REGEX.test(l));

    const startsNewInstitution =
      !isNoteLine &&
      hasSchoolAlready &&
      SCHOOL_HINT_REGEX.test(line);
    const startsNewDegreeEntry =
      !isNoteLine &&
      hasDegreeAlready &&
      !hasSchoolAlready &&
      DEGREE_HINT_REGEX.test(line);

    if (startsNewInstitution || startsNewDegreeEntry) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  return blocks.map((block, idx) => {
    let school = '';
    let degree = '';
    let location = '';
    let startDate = '';
    let endDate = '';
    let current = false;
    let gpa = '';
    const notes: string[] = [];

    for (const rawLine of block) {
      let line = stripBulletPrefix(rawLine);

      // Extract GPA
      const gpaMatch = line.match(/\bGPA\s*:?\s*(\d\.\d{1,2}(?:\s*\/\s*\d\.\d{1,2})?)/i);
      if (gpaMatch && !gpa) {
        gpa = gpaMatch[1].replace(/\s+/g, ' ').trim();
        line = line
          .replace(gpaMatch[0], ' ')
          .replace(/[()|•·,\s]+$/g, '')
          .replace(/^[()|•·,\s]+/g, '')
          .trim();
      }

      // Extract Date Range
      if (!startDate && !endDate) {
        const dateInfo = extractDateRange(line);
        if (dateInfo) {
          startDate = dateInfo.startDate;
          endDate = dateInfo.endDate;
          current = dateInfo.current;
          line = dateInfo.strippedText;
        }
      }

      // Extract Location
      if (!location) {
        const locMatch = line.match(LOCATION_REGEX);
        if (locMatch) {
          location = locMatch[0].trim();
          line = line
            .replace(locMatch[0], ' ')
            .replace(/[|•·,\-—–\s]+$/g, '')
            .replace(/^[|•·,\-—–\s]+/g, '')
            .trim();
        }
      }

      if (!line) continue;

      // Split if school and degree are on the same line separated by | or — or –
      const segments = line
        .split(/\s*(?:\||—|–)\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const seg of segments) {
        if (!school && SCHOOL_HINT_REGEX.test(seg) && !/coursework|honors|dean/i.test(seg)) {
          school = seg;
        } else if (!degree && DEGREE_HINT_REGEX.test(seg)) {
          degree = seg;
        } else if (!school && !degree) {
          school = seg;
        } else if (!degree && !/coursework|honors|dean|activities|club|scholarship/i.test(seg)) {
          degree = seg;
        } else {
          notes.push(seg);
        }
      }
    }

    return {
      id: `cv-edu-${idx + 1}`,
      school: school || block[0] || '',
      degree,
      location,
      startDate,
      endDate,
      current,
      gpa,
      description: notes.join(' • '),
    };
  });
}

function parseSkillsSection(skillLines: string[], fullText: string): string[] {
  const skillMap = new Map<string, string>();

  const addSkill = (raw: string) => {
    const cleaned = raw
      .replace(/^[\u2022•▪◦‣*-]\s*/, '')
      .replace(/^\s*(?:and|&)\s+/i, '')
      .replace(/\s*\((?:proficient|intermediate|basic|beginner|advanced|familiar|working\s+knowledge)\)\s*/gi, '')
      .trim();

    if (!cleaned || cleaned.length < 1 || cleaned.length > 40) return;
    if (cleaned.split(/\s+/).length > 5) return;
    if (/^\d+$/.test(cleaned)) return;

    const key = cleaned.toLowerCase();
    if (!skillMap.has(key)) {
      skillMap.set(key, cleaned);
    }
  };

  for (const rawLine of skillLines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Strip category prefix like "Languages:", "Frameworks & Tools:", "Databases:"
    const withoutPrefix = line.replace(
      /^[A-Za-z][A-Za-z0-9 &/-]{1,30}:\s+/,
      ''
    );

    const tokens = withoutPrefix.split(/[,|•·;]+/);
    for (const token of tokens) {
      addSkill(token);
    }
  }

  // Cross-check the full CV text against our curated RoleFit skill dictionary
  const dictionarySkills = extractDictionarySkillsFromText(fullText);
  for (const canonical of dictionarySkills) {
    const key = canonical.toLowerCase();
    if (!skillMap.has(key)) {
      skillMap.set(key, canonical);
    }
  }

  return Array.from(skillMap.values()).slice(0, 32);
}

function parseSimpleListSection(lines: string[]): string[] {
  const items: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const cleaned = stripBulletPrefix(rawLine.trim());
    if (!cleaned) continue;

    // Split short comma/pipe separated lines (e.g. "English (Native), Spanish (Fluent)")
    const parts =
      cleaned.length < 95 && /[,|•·]/.test(cleaned)
        ? cleaned.split(/[,|•·]+/)
        : [cleaned];

    for (const part of parts) {
      const item = part.trim();
      if (!item || item.length < 2) continue;
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push(item);
      }
    }
  }

  return items.slice(0, 12);
}

export function parseCvText(
  rawText: string,
  preserveStyle?: Partial<
    Pick<ResumeData, 'themeColor' | 'fontFamily' | 'spacing' | 'template' | 'sectionOrder'>
  >
): ParsedCvResult {
  const normalized = normalizeText(rawText);
  const lines = normalized.split('\n');

  const headerLines: string[] = [];
  const sectionBuckets: Record<CanonicalSection, string[]> = {
    summary: [],
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  };

  let currentSection: CanonicalSection | null = null;
  const detectedSectionOrder: CanonicalSection[] = [];

  for (const line of lines) {
    const heading = detectSectionHeading(line, currentSection);
    if (heading) {
      currentSection = heading.section;
      if (!detectedSectionOrder.includes(heading.section)) {
        detectedSectionOrder.push(heading.section);
      }
      if (heading.inlineContent) {
        sectionBuckets[currentSection].push(heading.inlineContent);
      }
      continue;
    }

    if (currentSection === null) {
      headerLines.push(line);
    } else {
      sectionBuckets[currentSection].push(line);
    }
  }

  const { personalInfo, inlineSummary } = extractPersonalInfo(headerLines, normalized);

  const summary =
    sectionBuckets.summary
      .map((l) => stripBulletPrefix(l.trim()))
      .filter(Boolean)
      .join(' ') || inlineSummary;

  const workExperience = parseExperienceSection(sectionBuckets.experience);
  const projects = parseProjectsSection(sectionBuckets.projects);
  const education = parseEducationSection(sectionBuckets.education);
  const skills = parseSkillsSection(sectionBuckets.skills, normalized);
  const certifications = parseSimpleListSection(sectionBuckets.certifications);
  const languages = parseSimpleListSection(sectionBuckets.languages);

  const defaultOrder: SectionId[] = [
    'summary',
    'education',
    'experience',
    'projects',
    'skills',
    'languages',
    'certifications',
  ];

  const resumeData: ResumeData = {
    ...DEFAULT_RESUME_DATA,
    personalInfo,
    summary,
    workExperience,
    education,
    projects,
    skills,
    languages,
    certifications,
    themeColor: preserveStyle?.themeColor || DEFAULT_RESUME_DATA.themeColor,
    fontFamily: preserveStyle?.fontFamily || DEFAULT_RESUME_DATA.fontFamily,
    spacing: preserveStyle?.spacing || DEFAULT_RESUME_DATA.spacing,
    template: preserveStyle?.template || DEFAULT_RESUME_DATA.template,
    sectionOrder: preserveStyle?.sectionOrder || defaultOrder,
  };

  const warnings: string[] = [];
  if (!personalInfo.fullName) {
    warnings.push('Could not automatically detect your full name — add it in Edit Resume.');
  }
  if (!personalInfo.email) {
    warnings.push('No email address detected in the uploaded CV.');
  }
  if (workExperience.length === 0 && projects.length === 0) {
    warnings.push(
      'No Experience or Projects section headings were detected. Try pasting clean text or organizing entries in Edit Resume.'
    );
  }
  if (education.length === 0) {
    warnings.push('No Education section detected.');
  }

  const experienceBulletsCount = workExperience.reduce(
    (sum, exp) => sum + exp.description.filter((b) => b.trim()).length,
    0
  );
  const projectBulletsCount = projects.reduce(
    (sum, proj) => sum + proj.description.filter((b) => b.trim()).length,
    0
  );
  const linksDetected = [personalInfo.linkedin, personalInfo.github, personalInfo.website].filter(
    Boolean
  ).length;

  const report: CvImportReport = {
    nameDetected: Boolean(personalInfo.fullName),
    emailDetected: Boolean(personalInfo.email),
    phoneDetected: Boolean(personalInfo.phone),
    linksDetected,
    experienceCount: workExperience.length,
    experienceBulletsCount,
    projectCount: projects.length,
    projectBulletsCount,
    educationCount: education.length,
    skillsCount: skills.length,
    certificationsCount: certifications.length,
    languagesCount: languages.length,
    hasSummary: Boolean(summary),
    detectedSections: detectedSectionOrder,
    warnings,
    rawText: normalized,
  };

  return { resumeData, report };
}
