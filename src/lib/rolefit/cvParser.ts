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
  | 'languages'
  | 'hobbies';

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  january: '01',
  januar: '01',
  feb: '02',
  february: '02',
  februar: '02',
  mar: '03',
  march: '03',
  märz: '03',
  maerz: '03',
  apr: '04',
  april: '04',
  may: '05',
  mai: '05',
  jun: '06',
  june: '06',
  juni: '06',
  jul: '07',
  july: '07',
  juli: '07',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  oct: '10',
  october: '10',
  okt: '10',
  oktober: '10',
  nov: '11',
  november: '11',
  dec: '12',
  december: '12',
  dez: '12',
  dezember: '12',
  spring: '01',
  summer: '06',
  fall: '09',
  autumn: '09',
  winter: '01',
};

const SECTION_PATTERNS: Array<{ section: CanonicalSection; regex: RegExp }> = [
  {
    section: 'summary',
    regex:
      /^(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|about|career\s+objective|objective)$/i,
  },
  {
    section: 'experience',
    regex:
      /^(?:work\s+experience|professional\s+experience|relevant\s+experience|internship\s+experience|industry\s+experience|employment\s+history|employment|work\s+history|internships|experience|berufserfahrung|praxiserfahrung)$/i,
  },
  {
    section: 'projects',
    regex:
      /^(?:key\s+projects|academic\s+projects|personal\s+projects|technical\s+projects|selected\s+projects|featured\s+projects|course\s+projects|projects|projects\s*&\s*research|extracurricular|extracurriculars|extracurricular\s+activities|leadership|leadership\s*&\s*engagement|leadership\s*&\s*activities|engagement|social\s+engagement|volunteering|activities|student\s+initiatives)$/i,
  },
  {
    section: 'education',
    regex:
      /^(?:education|academic\s+background|academics|education\s*&\s*coursework|academic\s+qualifications|ausbildung|studium)$/i,
  },
  {
    section: 'skills',
    regex:
      /^(?:technical\s+skills|skills\s*&\s*technologies|skills\s*&\s*tools|skills,?\s*languages\s*&\s*certifications|core\s+competencies|technical\s+proficiencies|technologies|tools\s*&\s*technologies|skills|fähigkeiten|kenntnisse|it[\s-]*(?:&|und)?\s*skills)$/i,
  },
  {
    section: 'certifications',
    regex:
      /^(?:certifications|licenses\s*&\s*certifications|certificates|awards|honors\s*&\s*awards|awards\s*&\s*honors|honors|zertifikate)$/i,
  },
  {
    section: 'languages',
    regex: /^(?:languages|spoken\s+languages|language\s+skills|sprachen)$/i,
  },
  {
    section: 'hobbies',
    regex:
      /^(?:hobbies\s*(?:&|and)\s*interests|interests\s*(?:&|and)\s*hobbies|hobbies|interests|personal\s+interests|hobbys|interessen|references|referenzen)$/i,
  },
];

const ORG_HINT_REGEX =
  /\b(?:gmbh|ag|sa|sarl|se|kg|ohg|ug|ltd|llc|inc\.?|corp\.?|corporation|company|co\.|group|partners|ventures|capital|advisory|labs|technologies|systems|solutions|consulting|bank|university|universität|hochschule|kantonsschule|gymnasium|institute|school|college|academy|armed\s+forces|army|club|society|association|foundation|symposium|global|eth|epfl|hsg)\b/i;

const ROLE_HINT_REGEX =
  /\b(?:intern|internship|engineer|developer|analyst|manager|fellow|assistant|lead|associate|consultant|designer|coordinator|researcher|director|president|vice\s+president|founder|co-founder|architect|specialist|technician|tutor|instructor|teaching\s+assistant|ta|officer|member|contributor|scientist|strategist|planner|soldier|advisor|partner|principal|outreach|business\s+development|gtm|engagement|volunteer)\b/i;

const SCHOOL_HINT_REGEX =
  /\b(?:university|universität|hochschule|kantonsschule|gymnasium|college|institute|school|academy|polytechnic|univ\.|eth\s+zürich|eth\s+zurich|epfl|hsg)\b/i;

const DEGREE_HINT_REGEX =
  /\b(?:b\.?s\.?|b\.?a\.?|b\.?sc\.?|b\.?eng\.?|b\.?tech\.?|m\.?s\.?|m\.?a\.?|m\.?sc\.?|m\.?b\.?a\.?|m\.?eng\.?|ph\.?d\.?|bachelor|master|associate|diploma|doctorate|undergraduate|matura|academic\s+high\s+school|high\s+school|candidate\s+for)\b/i;

const BULLET_PREFIX_REGEX = /^[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\u25CB•▪◦‣●○·*-]\s+/;

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

// Supports US ((415) 555-0182, 415-555-0182) and international (+41 79 555 01 42, +49 170 1234567)
const PHONE_REGEX =
  /(?:\+\d{1,3}[\s.-]?(?:\(0\)[\s.-]?)?(?:\d[\s.-]?){7,13}\d|\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b)/;

const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+/i;
const GITHUB_REGEX =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?/i;
const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:dev|app|io|com|org|net|edu|co|me|ai|xyz|ch|de|eu)(?:\/[^\s|,;)]*)?/gi;

const EUROPEAN_COUNTRIES =
  'Switzerland|Schweiz|Germany|Deutschland|Austria|Österreich|UK|United\\s+Kingdom|France|Italy|Spain|Netherlands|Belgium|Luxembourg|Sweden|Norway|Denmark|Singapore|China|Hong\\s+Kong|Canada|USA|United\\s+States|Australia|Japan|India|UAE|Qatar|Remote';

const US_CA_STATE_CODES =
  'AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|ON|BC|QC|AB';

const LOCATION_REGEX = new RegExp(
  `\\b(?:(?:St\\.\\s+|San\\s+|New\\s+|Los\\s+|Las\\s+|Palo\\s+|Hong\\s+)?[A-ZÄÖÜ][a-zA-Zäöüß]+(?:\\s+[A-ZÄÖÜ][a-zA-Zäöüß]+){0,2},\\s*(?:(?:${US_CA_STATE_CODES})\\b|(?:${EUROPEAN_COUNTRIES})\\b))|\\bRemote\\b`
);

// Street + postal code + city + country (e.g. "Bahnhofstrasse 10, 8001 Zurich, Switzerland")
const STREET_ADDRESS_REGEX = new RegExp(
  `[A-Za-zÄÖÜäöüß\\s.-]+\\d+[a-zA-Z]?,\\s*\\d{4,5}\\s+[A-ZÄÖÜ][a-zA-Zäöüß\\s.-]+(?:,\\s*(?:${EUROPEAN_COUNTRIES}))?`
);

const BIRTHDATE_OR_NATIONALITY_REGEX =
  /(?:\b\d{1,2}\.\d{1,2}\.(?:19|20)\d{2}\b|\b(?:date\s+of\s+birth|dob|born|geboren|nationality|citizenship|staatsangehörigkeit)\b)/i;

const SPOKEN_LANGUAGES_HINT =
  /\b(?:english|german|swiss\s+german|deutsch|spanish|mandarin|chinese|french|italian|japanese|korean|hindi|arabic|portuguese|russian|serbian|bulgarian|macedonian|cantonese|vietnamese|native|fluent|conversational|bilingual|toefl|ielts|c1|c2|b1|b2)\b/i;

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
  const letters = name.replace(/[^a-zA-ZÄÖÜäöü]/g, '');
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    return name
      .toLowerCase()
      .replace(/(?:^|[\s-])([a-zäöü])/g, (m) => m.toUpperCase());
  }
  return name;
}

function normalizeSingleDateToken(token: string): { ym: string; isPresent: boolean } {
  const cleaned = token
    .trim()
    .replace(/^expected\s+/i, '')
    .replace(/^exp\.?\s+/i, '')
    .replace(/^class\s+of\s+/i, '')
    .replace(/^since\s+/i, '')
    .replace(/\.$/, '');

  if (/^(?:present|current|now|ongoing|today|heute|aktuell|to\s+date)$/i.test(cleaned)) {
    return { ym: '', isPresent: true };
  }

  // YYYY-MM
  const isoMatch = cleaned.match(/^((?:19|20)\d{2})-(\d{1,2})$/);
  if (isoMatch) {
    return { ym: `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}`, isPresent: false };
  }

  // MM.YYYY or MM/YYYY or MM-YYYY (European dot format e.g. 08.2025, 06.2026)
  const numericMonthMatch = cleaned.match(/^(\d{1,2})[./-]((?:19|20)\d{2})$/);
  if (numericMonthMatch) {
    const monthNum = Math.min(12, Math.max(1, parseInt(numericMonthMatch[1], 10)));
    return {
      ym: `${numericMonthMatch[2]}-${String(monthNum).padStart(2, '0')}`,
      isPresent: false,
    };
  }

  // Month YYYY (e.g. "May 2024", "Sept 2023", "Summer 2025")
  const wordMatch = cleaned.match(/^([A-Za-zÄÖÜäöü]+)\.?\s*,?\s*((?:19|20)\d{2})$/);
  if (wordMatch) {
    const mKey = wordMatch[1].toLowerCase();
    const mm = MONTH_MAP[mKey] || '01';
    return { ym: `${wordMatch[2]}-${mm}`, isPresent: false };
  }

  // Year only (e.g. "2023")
  const yearMatch = cleaned.match(/^((?:19|20)\d{2})$/);
  if (yearMatch) {
    return { ym: `${yearMatch[1]}-01`, isPresent: false };
  }

  return { ym: '', isPresent: false };
}

function extractDateRange(line: string): ParsedDateRange | null {
  // Never match full DD.MM.YYYY birth dates as employment/education date ranges
  if (/\b\d{1,2}\.\d{1,2}\.(?:19|20)\d{2}\b/.test(line)) {
    return null;
  }

  // Handle PDF extraction glitch where two MM.YYYY dates concatenate without dash: "07.202105.2022"
  const gluedMatch = line.match(/\b(\d{2}\.(?:19|20)\d{2})(\d{2}\.(?:19|20)\d{2})\b/);
  if (gluedMatch) {
    const start = normalizeSingleDateToken(gluedMatch[1]);
    const end = normalizeSingleDateToken(gluedMatch[2]);
    const stripped = line
      .replace(gluedMatch[0], ' ')
      .replace(/[|,()[\]\s]+$/g, '')
      .replace(/^[|,()[\]\s]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return {
      startDate: start.ym,
      endDate: end.ym,
      current: false,
      strippedText: stripped,
    };
  }

  const dateAtom =
    '(?:(?:Expected|Exp\\.?|Class\\s+of|Since)\\s+)?(?:(?:Jan(?:uary|uar)?|Feb(?:ruary|ruar)?|Mar(?:ch)?|März|Maerz|Apr(?:il)?|May|Mai|Jun(?:e|i)?|Jul(?:y|i)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Okt(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Dez(?:ember)?|Spring|Summer|Fall|Autumn|Winter)\\.?\\s*,?\\s*(?:19|20)\\d{2}|\\d{1,2}[./-](?:19|20)\\d{2}|(?:19|20)\\d{2}-\\d{1,2}|(?:19|20)\\d{2})';
  const endAtom = `(?:Present|Current|Now|Ongoing|Today|Heute|Aktuell|${dateAtom})`;

  // Match ranges with dash/en-dash/em-dash/"to" OR dropped dash before Present/MM.YYYY (e.g. "08.2025 Present")
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

  // Dropped-dash PDF quirk: "08.2025 Present" or "06.2026 08.2026"
  const spaceRangeRegex =
    /\b(\d{1,2}\.(?:19|20)\d{2})\s+(Present|Current|Heute|\d{1,2}\.(?:19|20)\d{2})\b/i;
  const spaceRangeMatch = line.match(spaceRangeRegex);
  if (spaceRangeMatch) {
    const start = normalizeSingleDateToken(spaceRangeMatch[1]);
    const end = normalizeSingleDateToken(spaceRangeMatch[2]);
    const stripped = line
      .replace(spaceRangeMatch[0], ' ')
      .replace(/[|,()[\]\s]+$/g, '')
      .replace(/^[|,()[\]\s]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return {
      startDate: start.ym,
      endDate: end.isPresent ? '' : end.ym,
      current: end.isPresent,
      strippedText: stripped,
    };
  }

  // Single date like "Expected June 2027" or "May 2025" (only on non-sentence header lines)
  if (line.length <= 120) {
    const singleRegex = new RegExp(
      `(?:Expected|Exp\\.?|Class\\s+of|Graduating)?\\s*(${dateAtom})`,
      'i'
    );
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
    .replace(/^[^A-Za-zÄÖÜäöü]+/, '')
    .replace(/[:\-—–|_=\s]+$/, '')
    .trim();

  if (cleanHeading.length >= 3 && cleanHeading.length <= 48) {
    for (const { section, regex } of SECTION_PATTERNS) {
      if (regex.test(cleanHeading)) {
        return { section };
      }
    }
  }

  // Check inline heading like "Technical Skills: Python, React, SQL"
  const inlineMatch = trimmed.match(/^([A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü &/-]{2,30}):\s+(.+)$/);
  if (inlineMatch) {
    const prefix = inlineMatch[1].trim();
    const rest = inlineMatch[2].trim();
    // Avoid treating "Languages: Python, JavaScript" inside Skills as spoken Languages
    if (
      /^languages$/i.test(prefix) &&
      currentSection === 'skills' &&
      !SPOKEN_LANGUAGES_HINT.test(rest)
    ) {
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
  // Filter out European birth-date / nationality lines before scanning phone/location/title
  const cleanHeaderLines = headerLines.filter(
    (line) => !BIRTHDATE_OR_NATIONALITY_REGEX.test(line.trim())
  );
  const headerText = cleanHeaderLines.join('\n');

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
    if (emailDomain && (lower === emailDomain || emailDomain.endsWith(lower))) continue;
    if (email && email.toLowerCase().includes(lower)) continue;
    website = rawUrl.replace(/^https?:\/\/(?:www\.)?/i, '');
    break;
  }

  // Extract location / full European street address from header lines (2-pass: prefer explicit street address)
  let location = '';
  for (const line of cleanHeaderLines) {
    const cleaned = line
      .replace(EMAIL_REGEX, ' ')
      .replace(PHONE_REGEX, ' ')
      .replace(LINKEDIN_REGEX, ' ')
      .replace(GITHUB_REGEX, ' ')
      .replace(URL_REGEX, ' ')
      .trim();

    const streetMatch = cleaned.match(STREET_ADDRESS_REGEX);
    if (streetMatch) {
      location = streetMatch[0].trim();
      break;
    }
  }
  if (!location) {
    for (const line of cleanHeaderLines) {
      const cleaned = line
        .replace(EMAIL_REGEX, ' ')
        .replace(PHONE_REGEX, ' ')
        .replace(LINKEDIN_REGEX, ' ')
        .replace(GITHUB_REGEX, ' ')
        .replace(URL_REGEX, ' ')
        .trim();

      const locMatch = cleaned.match(LOCATION_REGEX);
      if (locMatch) {
        location = locMatch[0].trim();
        break;
      }
    }
  }

  // Identify fullName and optional jobTitle / inlineSummary from top non-contact lines
  let fullName = '';
  let jobTitle = '';
  let inlineSummary = '';

  const nonContactLines = cleanHeaderLines
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (STREET_ADDRESS_REGEX.test(line)) return false;
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
    if (second.length <= 120 && !EMAIL_REGEX.test(second) && !PHONE_REGEX.test(second)) {
      jobTitle = second;
    } else if (second.length > 120) {
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

/**
 * Smart header splitter handling both:
 *  - Org | Role | Location  (DACH/HSG standard, e.g. "Example GmbH | Founder's Associate | St. Gallen, Switzerland")
 *  - Role | Org | Location  (US/Leadership standard, e.g. "Founder and President | Student Strategy Club | Zurich, Switzerland")
 */
function splitRoleAndCompany(
  headerLines: string[]
): { position: string; company: string; location: string } {
  let location = '';
  const allSegments: string[] = [];

  for (const rawLine of headerLines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Split on pipe first if present (most explicit separator in DACH/HSG & tech resumes)
    if (line.includes('|')) {
      const pipeParts = line
        .split('|')
        .map((p) => p.trim())
        .filter(Boolean);
      for (const seg of pipeParts) {
        if (!location && LOCATION_REGEX.test(seg) && !ORG_HINT_REGEX.test(seg) && !ROLE_HINT_REGEX.test(seg)) {
          location = seg.match(LOCATION_REGEX)?.[0]?.trim() || seg;
        } else {
          allSegments.push(seg);
        }
      }
      continue;
    }

    // Otherwise extract trailing location if present
    let next = line;
    if (!location) {
      const loc = next.match(LOCATION_REGEX);
      if (loc && next.length > loc[0].length + 2) {
        location = loc[0].trim();
        next = next
          .replace(loc[0], ' ')
          .replace(/[|•·,\-—–\s]+$/g, '')
          .replace(/^[|•·,\-—–\s]+/g, '')
          .trim();
      }
    }

    const sepParts = next
      .split(/\s*(?:—|–|\s-\s|\s+at\s+|•)\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);

    for (const seg of sepParts) {
      if (!location && LOCATION_REGEX.test(seg) && !ORG_HINT_REGEX.test(seg) && !ROLE_HINT_REGEX.test(seg)) {
        location = seg.match(LOCATION_REGEX)?.[0]?.trim() || seg;
      } else {
        allSegments.push(seg);
      }
    }
  }

  if (allSegments.length === 0) {
    return { position: '', company: '', location };
  }

  if (allSegments.length >= 2) {
    const first = allSegments[0];
    const second = allSegments[1];

    const firstIsOrg = ORG_HINT_REGEX.test(first);
    const secondIsOrg = ORG_HINT_REGEX.test(second);
    const firstIsRole = ROLE_HINT_REGEX.test(first);
    const secondIsRole = ROLE_HINT_REGEX.test(second);

    // Explicit Org | Role (e.g. "Example GmbH | Founder's Associate", "Example AG | Business Development", "Swiss Armed Forces | Infantry Soldier")
    if ((firstIsOrg && !secondIsOrg) || (secondIsRole && !firstIsRole)) {
      return { company: first, position: second, location };
    }
    // Explicit Role | Org (e.g. "Founder and President | Student Strategy Club")
    if ((firstIsRole && !secondIsRole) || (secondIsOrg && !firstIsOrg)) {
      return { position: first, company: second, location };
    }

    return { position: first, company: second, location };
  }

  // Fallback comma split if short (e.g. "Software Engineering Intern, Acme Corp")
  const single = allSegments[0];
  if (single.includes(',')) {
    const commaParts = single.split(',').map((p) => p.trim()).filter(Boolean);
    if (commaParts.length === 2) {
      const [a, b] = commaParts;
      if (ORG_HINT_REGEX.test(a) || (ROLE_HINT_REGEX.test(b) && !ROLE_HINT_REGEX.test(a))) {
        return { company: a, position: b, location };
      }
      return { position: a, company: b, location };
    }
  }

  return { position: single, company: '', location };
}

/**
 * Split unbulleted paragraph descriptions into clean individual bullet points
 * if an entry has multi-sentence prose with no explicit bullet markers.
 */
function normalizeUnbulletedParagraphs(paragraphs: string[]): string[] {
  const result: string[] = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    // If a single unbulleted paragraph contains multiple distinct sentences (>150 chars), split cleanly
    if (trimmed.length > 150) {
      const sentences = trimmed
        .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15);
      if (sentences.length > 1) {
        result.push(...sentences);
        continue;
      }
    }
    result.push(trimmed);
  }
  return result;
}

function parseExperienceSection(lines: string[]): WorkExperience[] {
  const entries: Array<{
    headerLines: string[];
    bullets: string[];
    unbulletedParagraphs: string[];
    startDate: string;
    endDate: string;
    current: boolean;
  }> = [];

  let currentEntry: (typeof entries)[number] | null = null;
  let sawBlankLine = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      sawBlankLine = true;
      continue;
    }

    const isBullet = BULLET_PREFIX_REGEX.test(line);
    if (isBullet) {
      if (!currentEntry) {
        currentEntry = {
          headerLines: [],
          bullets: [],
          unbulletedParagraphs: [],
          startDate: '',
          endDate: '',
          current: false,
        };
        entries.push(currentEntry);
      }
      const bulletText = stripBulletPrefix(line);
      if (bulletText) currentEntry.bullets.push(bulletText);
      sawBlankLine = false;
      continue;
    }

    const dateInfo = extractDateRange(line);

    // Check if this non-bullet line is a wrapped continuation of the previous bullet
    if (currentEntry && currentEntry.bullets.length > 0 && !dateInfo) {
      const lastBullet = currentEntry.bullets[currentEntry.bullets.length - 1];
      const startsLowercase = /^[a-zäöü]/.test(line);
      const prevIncomplete = !/[.!?]$/.test(lastBullet);
      const looksLikeNewHeader =
        line.length < 110 &&
        (line.includes('|') ||
          line.includes('—') ||
          line.includes('–') ||
          ORG_HINT_REGEX.test(line) ||
          ROLE_HINT_REGEX.test(line)) &&
        !startsLowercase &&
        (!prevIncomplete || sawBlankLine);

      if (startsLowercase || (prevIncomplete && !looksLikeNewHeader)) {
        currentEntry.bullets[currentEntry.bullets.length - 1] = `${lastBullet} ${line}`;
        sawBlankLine = false;
        continue;
      }
    }

    // Check if this is an unbulleted paragraph accomplishment under the current entry
    if (
      currentEntry &&
      !dateInfo &&
      currentEntry.headerLines.length >= 1 &&
      !line.includes('|') &&
      (line.length > 75 || /^[a-zäöü]/.test(line) || /[.!?]$/.test(line)) &&
      !ORG_HINT_REGEX.test(line.slice(0, 40))
    ) {
      if (
        !sawBlankLine &&
        currentEntry.unbulletedParagraphs.length > 0 &&
        !/[.!?]$/.test(
          currentEntry.unbulletedParagraphs[currentEntry.unbulletedParagraphs.length - 1]
        )
      ) {
        const lastIdx = currentEntry.unbulletedParagraphs.length - 1;
        currentEntry.unbulletedParagraphs[lastIdx] = `${currentEntry.unbulletedParagraphs[lastIdx]} ${line}`;
      } else {
        currentEntry.unbulletedParagraphs.push(line);
      }
      sawBlankLine = false;
      continue;
    }

    const shouldStartNew =
      !currentEntry ||
      currentEntry.bullets.length > 0 ||
      currentEntry.unbulletedParagraphs.length > 0 ||
      Boolean(dateInfo && (currentEntry.startDate || currentEntry.endDate)) ||
      (line.includes('|') && currentEntry.headerLines.length >= 1) ||
      currentEntry.headerLines.length >= 2;

    if (shouldStartNew) {
      currentEntry = {
        headerLines: [],
        bullets: [],
        unbulletedParagraphs: [],
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
    sawBlankLine = false;
  }

  return entries
    .filter(
      (e) =>
        e.headerLines.length > 0 ||
        e.bullets.length > 0 ||
        e.unbulletedParagraphs.length > 0
    )
    .map((entry, idx) => {
      const { position, company, location } = splitRoleAndCompany(entry.headerLines);
      const finalBullets =
        entry.bullets.length > 0
          ? entry.bullets
          : normalizeUnbulletedParagraphs(entry.unbulletedParagraphs);

      return {
        id: `cv-exp-${idx + 1}`,
        position: position || 'Role Title',
        company: company || '',
        location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        current: entry.current,
        description: finalBullets.length > 0 ? finalBullets : [''],
      };
    });
}

function parseProjectsSection(lines: string[]): Project[] {
  const entries: Array<{
    headerLines: string[];
    bullets: string[];
    unbulletedParagraphs: string[];
    explicitTech: string[];
    githubLink: string;
    liveLink: string;
    dateLabel: string;
  }> = [];

  let currentEntry: (typeof entries)[number] | null = null;
  let sawBlankLine = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      sawBlankLine = true;
      continue;
    }

    // Explicit tech line inside project (e.g. "Technologies: React, Node.js, PostgreSQL")
    const techLineMatch = line.match(
      /^(?:technologies|tech\s+stack|stack|tools|built\s+with)\s*:\s*(.+)$/i
    );
    if (techLineMatch && currentEntry) {
      const items = techLineMatch[1]
        .split(/[,|•·;/]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 32);
      currentEntry.explicitTech.push(...items);
      sawBlankLine = false;
      continue;
    }

    const isBullet = BULLET_PREFIX_REGEX.test(line);
    if (isBullet) {
      if (!currentEntry) {
        currentEntry = {
          headerLines: [],
          bullets: [],
          unbulletedParagraphs: [],
          explicitTech: [],
          githubLink: '',
          liveLink: '',
          dateLabel: '',
        };
        entries.push(currentEntry);
      }
      const bulletText = stripBulletPrefix(line);
      if (bulletText) currentEntry.bullets.push(bulletText);
      sawBlankLine = false;
      continue;
    }

    const dateInfo = extractDateRange(line);

    // Continuation line of previous bullet
    if (currentEntry && currentEntry.bullets.length > 0 && !dateInfo) {
      const lastBullet = currentEntry.bullets[currentEntry.bullets.length - 1];
      const startsLowercase = /^[a-zäöü]/.test(line);
      const prevIncomplete = !/[.!?]$/.test(lastBullet);
      const looksLikeProjectTitle =
        !startsLowercase &&
        line.length < 110 &&
        (line.includes('|') || line.includes('—') || line.includes('–')) &&
        (!prevIncomplete || sawBlankLine);

      if (startsLowercase || (prevIncomplete && !looksLikeProjectTitle)) {
        currentEntry.bullets[currentEntry.bullets.length - 1] = `${lastBullet} ${line}`;
        sawBlankLine = false;
        continue;
      }
    }

    // Unbulleted accomplishment paragraph under current project/extracurricular
    if (
      currentEntry &&
      !dateInfo &&
      currentEntry.headerLines.length >= 1 &&
      !line.includes('|') &&
      (line.length > 75 || /^[a-zäöü]/.test(line) || /[.!?]$/.test(line))
    ) {
      if (
        !sawBlankLine &&
        currentEntry.unbulletedParagraphs.length > 0 &&
        !/[.!?]$/.test(
          currentEntry.unbulletedParagraphs[currentEntry.unbulletedParagraphs.length - 1]
        )
      ) {
        const lastIdx = currentEntry.unbulletedParagraphs.length - 1;
        currentEntry.unbulletedParagraphs[lastIdx] = `${currentEntry.unbulletedParagraphs[lastIdx]} ${line}`;
      } else {
        currentEntry.unbulletedParagraphs.push(line);
      }
      sawBlankLine = false;
      continue;
    }

    const shouldStartNew =
      !currentEntry ||
      currentEntry.bullets.length > 0 ||
      currentEntry.unbulletedParagraphs.length > 0 ||
      Boolean(dateInfo) ||
      (line.includes('|') && currentEntry.headerLines.length >= 1) ||
      currentEntry.headerLines.length >= 2;

    if (shouldStartNew) {
      currentEntry = {
        headerLines: [],
        bullets: [],
        unbulletedParagraphs: [],
        explicitTech: [],
        githubLink: '',
        liveLink: '',
        dateLabel: '',
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
      if (dateInfo) {
        cleaned = dateInfo.strippedText;
        const startStr = dateInfo.startDate;
        const endStr = dateInfo.current ? 'Present' : dateInfo.endDate;
        currentEntry.dateLabel = startStr && endStr ? `${startStr} – ${endStr}` : startStr || endStr;
      }
      if (cleaned) currentEntry.headerLines.push(cleaned);
    }
    sawBlankLine = false;
  }

  return entries
    .filter(
      (e) =>
        e.headerLines.length > 0 ||
        e.bullets.length > 0 ||
        e.unbulletedParagraphs.length > 0
    )
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

        // Filter trailing pure-location pipe segment (e.g. "Founder and President | Student Strategy Club | St. Gallen, Switzerland")
        const nonLocParts = parts.filter(
          (seg, i) =>
            !(
              i === parts.length - 1 &&
              parts.length >= 3 &&
              LOCATION_REGEX.test(seg) &&
              !ORG_HINT_REGEX.test(seg)
            )
        );

        if (nonLocParts.length >= 2) {
          const [first, second] = nonLocParts;
          const firstIsRole = ROLE_HINT_REGEX.test(first) && !ORG_HINT_REGEX.test(first);
          const secondIsOrg = ORG_HINT_REGEX.test(second);
          const secondLooksLikeTechList =
            second.includes(',') &&
            !ORG_HINT_REGEX.test(second) &&
            extractDictionarySkillsFromText(second).length >= 2;

          if (secondLooksLikeTechList) {
            name = first;
            second.split(',').forEach(addTech);
          } else if (firstIsRole && secondIsOrg) {
            // e.g. "Founder and President | Student Strategy Club"
            name = second;
            role = first;
          } else {
            name = first;
            role = second;
          }

          for (let i = 2; i < nonLocParts.length; i++) {
            const seg = nonLocParts[i];
            if (seg.includes(',') && extractDictionarySkillsFromText(seg).length >= 2) {
              seg.split(',').forEach(addTech);
            } else if (!role) {
              role = seg;
            }
          }
        } else {
          name = nonLocParts[0] || primary;
        }

        if (entry.headerLines.length > 1) {
          const secondary = entry.headerLines[1];
          if (secondary.includes(',') && extractDictionarySkillsFromText(secondary).length >= 2) {
            secondary.split(',').forEach(addTech);
          } else if (!role) {
            role = secondary;
          }
        }
      }

      const finalBullets =
        entry.bullets.length > 0
          ? entry.bullets
          : normalizeUnbulletedParagraphs(entry.unbulletedParagraphs);

      // Supplement technologies with dictionary skills found in project bullets (for tech/analytical projects)
      if (techSet.size < 3) {
        const inferred = extractDictionarySkillsFromText([name, ...finalBullets].join(' '));
        inferred.slice(0, 5).forEach(addTech);
      }

      return {
        id: `cv-proj-${idx + 1}`,
        name: name || `Project ${idx + 1}`,
        role: role || entry.dateLabel,
        technologies: Array.from(techSet.values()).slice(0, 8),
        githubLink: entry.githubLink,
        liveLink: entry.liveLink,
        description: finalBullets.length > 0 ? finalBullets : [''],
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

    const isBullet = BULLET_PREFIX_REGEX.test(line);
    if (isBullet) {
      // Bullets (e.g. exchange semester mentioning a partner University, thesis, certifications)
      // NEVER start a new Education entry; attach them to the current block.
      if (currentBlock.length > 0) {
        const last = currentBlock[currentBlock.length - 1];
        void last;
      }
      currentBlock.push(line);
      continue;
    }

    // Check if this non-bullet line is a wrapped continuation of a preceding bullet inside Education
    if (currentBlock.length > 0) {
      const prevLine = currentBlock[currentBlock.length - 1];
      const dateInfo = extractDateRange(line);
      const startsLowercase = /^[a-zäöü]/.test(line);
      const prevIsBulletIncomplete =
        BULLET_PREFIX_REGEX.test(prevLine) && !/[.!?]$/.test(prevLine);

      if (!dateInfo && !line.includes('|') && (startsLowercase || prevIsBulletIncomplete)) {
        currentBlock[currentBlock.length - 1] = `${prevLine} ${line}`;
        continue;
      }
    }

    const cleanNoBullet = stripBulletPrefix(line);
    const isNoteLine =
      /^(?:relevant\s+coursework|coursework|dean'?s\s+list|honors|awards|activities|clubs|gpa|minor|focus\s+on|partner\s+exchange|bachelor\s+thesis|master\s+thesis|certifications\s+in|completed\s+the|built\s+an)\b/i.test(
        cleanNoBullet
      );

    const hasDate = Boolean(extractDateRange(line));
    const hasSchoolAlready = currentBlock.some(
      (l) => !BULLET_PREFIX_REGEX.test(l) && SCHOOL_HINT_REGEX.test(l) && !/coursework|dean/i.test(l)
    );
    const hasDegreeAlready = currentBlock.some(
      (l) => !BULLET_PREFIX_REGEX.test(l) && DEGREE_HINT_REGEX.test(l)
    );

    const startsNewInstitution =
      !isNoteLine &&
      currentBlock.length > 0 &&
      ((hasSchoolAlready && (SCHOOL_HINT_REGEX.test(line) || (line.includes('|') && hasDate))) ||
        (hasDegreeAlready && !hasSchoolAlready && DEGREE_HINT_REGEX.test(line)));

    if (startsNewInstitution) {
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
      const isBullet = BULLET_PREFIX_REGEX.test(rawLine);
      let line = stripBulletPrefix(rawLine);

      // Extract GPA (supports US 3.85/4.0 and European/Swiss 5.40/6.0 or "Current GPA: 5.40/6.0")
      const gpaMatch = line.match(
        /\b(?:Current\s+)?GPA\s*:?\s*(\d[.,]\d{1,2}(?:\s*\/\s*\d[.,]\d{1,2})?)/i
      );
      if (gpaMatch && !gpa) {
        gpa = gpaMatch[1].replace(/\s+/g, '').trim();
        if (!isBullet) {
          line = line
            .replace(gpaMatch[0], ' ')
            .replace(/[()|•·,\s]+$/g, '')
            .replace(/^[()|•·,\s]+/g, '')
            .trim();
        }
      }

      if (isBullet) {
        if (line) notes.push(line);
        continue;
      }

      // Extract Date Range on non-bullet header lines
      if (!startDate && !endDate) {
        const dateInfo = extractDateRange(line);
        if (dateInfo) {
          startDate = dateInfo.startDate;
          endDate = dateInfo.endDate;
          current = dateInfo.current;
          line = dateInfo.strippedText;
        }
      }

      if (!line) continue;

      // Split if school, degree, and location are pipe-separated (e.g. "University of St. Gallen | M.A. HSG in Business Innovation | St. Gallen, Switzerland")
      const segments = line
        .split(/\s*(?:\||—|–)\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const seg of segments) {
        if (
          !location &&
          LOCATION_REGEX.test(seg) &&
          !SCHOOL_HINT_REGEX.test(seg) &&
          !DEGREE_HINT_REGEX.test(seg)
        ) {
          location = seg.match(LOCATION_REGEX)?.[0]?.trim() || seg;
        } else if (!school && SCHOOL_HINT_REGEX.test(seg) && !/coursework|honors|dean/i.test(seg)) {
          school = seg;
        } else if (!degree && DEGREE_HINT_REGEX.test(seg)) {
          degree = seg;
        } else if (!school && !degree) {
          school = seg;
        } else if (
          !degree &&
          !/coursework|honors|dean|activities|club|scholarship|focus|thesis/i.test(seg)
        ) {
          degree = seg;
        } else {
          notes.push(seg);
        }
      }
    }

    return {
      id: `cv-edu-${idx + 1}`,
      school: school || stripBulletPrefix(block[0] || ''),
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

function parseSkillsSection(skillLines: string[], nonHobbyCvText: string): string[] {
  const skillMap = new Map<string, string>();

  const addSkill = (raw: string) => {
    const cleaned = raw
      .replace(/^[\u2022•▪◦‣*-]\s*/, '')
      .replace(/^\s*(?:and|&)\s+/i, '')
      .replace(/^\s*basic\s+/i, '')
      .replace(
        /\s*\((?:proficient|intermediate|basic|beginner|advanced|familiar|working\s+knowledge)\)\s*/gi,
        ''
      )
      .replace(/[.;]+$/g, '')
      .trim();

    if (!cleaned || cleaned.length < 2 || cleaned.length > 48) return;
    if (cleaned.split(/\s+/).length > 6) return;
    if (/^\d+$/.test(cleaned)) return;

    // Split simple paired languages like "Python/Java" while preserving "CI/CD", "A/B Testing", "UI/UX", "No-Code/Low-Code"
    if (
      /^[A-Za-z+#]+\/[A-Za-z+#]+$/.test(cleaned) &&
      !/^(?:ci\/cd|ui\/ux|a\/b|m&a|vc\/pe|b2b\/b2c|no-code\/low-code)$/i.test(cleaned)
    ) {
      cleaned.split('/').forEach((part) => addSkill(part));
      return;
    }

    const key = cleaned.toLowerCase();
    if (!skillMap.has(key)) {
      skillMap.set(key, cleaned);
    }
  };

  // Stitch wrapped lines within categorized skill entries (e.g. "AI & Digital Innovation: ..." wrapping onto line 2)
  const stitchedLines: string[] = [];
  for (const rawLine of skillLines) {
    const line = rawLine.trim();
    if (!line) continue;
    const hasCategoryPrefix = /^[A-Za-zÄÖÜäöü][A-Za-z0-9 &/-]{1,32}:\s+/.test(line);
    if (stitchedLines.length > 0 && !hasCategoryPrefix && !BULLET_PREFIX_REGEX.test(line)) {
      stitchedLines[stitchedLines.length - 1] = `${stitchedLines[stitchedLines.length - 1]} ${line}`;
    } else {
      stitchedLines.push(line);
    }
  }

  for (const line of stitchedLines) {
    // Strip category prefix like "AI & Digital Innovation:", "Strategy & Tools:", "Languages:"
    const withoutPrefix = line.replace(/^[A-Za-zÄÖÜäöü][A-Za-z0-9 &/-]{1,32}:\s+/, '');

    // Split on commas, semicolons, pipes, bullets, AND trailing " and " conjunctions
    const tokens = withoutPrefix
      .split(/[,|•·;]+/)
      .flatMap((chunk) => chunk.split(/\s+and\s+/i));

    for (const token of tokens) {
      addSkill(token);
    }
  }

  // Cross-check non-hobby CV text against our curated RoleFit skill dictionary
  const dictionarySkills = extractDictionarySkillsFromText(nonHobbyCvText);
  for (const canonical of dictionarySkills) {
    const key = canonical.toLowerCase();
    if (!skillMap.has(key)) {
      skillMap.set(key, canonical);
    }
  }

  return Array.from(skillMap.values()).slice(0, 36);
}

function parseLanguagesSection(lines: string[]): string[] {
  // Join wrapped lines cleanly (e.g. "...French and\nRussian basic.")
  const joined = lines
    .map((l) => stripBulletPrefix(l.trim()))
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!joined) return [];

  // Prefer semicolon splitting when semicolons exist (standard DACH/HSG language grouping!)
  const parts = joined.includes(';')
    ? joined.split(';')
    : joined.split(/[,|•·]+/);

  const items: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const cleaned = part.replace(/\.$/, '').trim();
    if (!cleaned || cleaned.length < 2) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push(cleaned);
    }
  }

  return items.slice(0, 12);
}

function parseSimpleListSection(lines: string[]): string[] {
  const items: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const cleaned = stripBulletPrefix(rawLine.trim());
    if (!cleaned) continue;

    const parts =
      cleaned.length < 95 && /[,|•·;]/.test(cleaned)
        ? cleaned.split(/[,|•·;]+/)
        : [cleaned];

    for (const part of parts) {
      const item = part.replace(/\.$/, '').trim();
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
    hobbies: [],
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

  // Build non-hobby CV text so Hobbies & Interests never leak into Skill Dictionary cross-check
  const nonHobbyCvText = [
    ...headerLines,
    ...sectionBuckets.summary,
    ...sectionBuckets.education,
    ...sectionBuckets.experience,
    ...sectionBuckets.projects,
    ...sectionBuckets.skills,
    ...sectionBuckets.certifications,
  ].join('\n');

  const { personalInfo, inlineSummary } = extractPersonalInfo(headerLines, nonHobbyCvText);

  const summary =
    sectionBuckets.summary
      .map((l) => stripBulletPrefix(l.trim()))
      .filter(Boolean)
      .join(' ') || inlineSummary;

  const workExperience = parseExperienceSection(sectionBuckets.experience);
  const projects = parseProjectsSection(sectionBuckets.projects);
  const education = parseEducationSection(sectionBuckets.education);
  const skills = parseSkillsSection(sectionBuckets.skills, nonHobbyCvText);
  const certifications = parseSimpleListSection(sectionBuckets.certifications);
  const languages = parseLanguagesSection(sectionBuckets.languages);

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
    detectedSections: detectedSectionOrder.filter((s) => s !== 'hobbies'),
    warnings,
    rawText: normalized,
  };

  return { resumeData, report };
}
