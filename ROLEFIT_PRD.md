# RoleFit Resume Tailor — Product Requirements Document (PRD) & Technical Architecture

## 1. Executive Summary
**RoleFit Resume Tailor** is an early-career & student-focused resume tailoring workspace built on top of `iam-neo/Resume-Maker` (Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide Icons). It empowers students and new-grad applicants to paste any internship or entry-level Job Description (JD), immediately see their **RoleFit Match Score (0–100%)**, identify matched vs. missing keywords with synonym normalization, and inject tailored **XYZ / STAR impact bullets** or skills directly into their live A4 resume with a single click — **100% client-side, zero API keys, and zero server uploads**.

---

## 2. Core Guardrails & Non-Negotiables
1. **100% Client-Side & Zero API Keys:**
   - All JD tokenization, skill dictionary matching, synonym normalization, bullet template generation, and ATS checks execute deterministically in TypeScript inside the browser.
   - No backend routes, no databases, and no paid LLM API dependencies.
   - Note: `next.config.ts` uses `output: 'export'`, so all features must remain fully compatible with static export.
2. **Protect ATS PDF Export (`@media print`):**
   - Every new RoleFit UI element, mode toggle, drawer, badge, or banner MUST carry `print:hidden` (and/or reside inside `.no-print` / `.editor-panel` containers).
   - Browser print (`window.print()`) must output **only** the clean, selectable-text A4 `.resume-sheet` across all 3 templates.
3. **Preserve All Existing Resume-Maker Features:**
   - Keep all 3 templates (`Modern`, `Executive`, `Minimalist`), 8 accent colors + custom HEX picker, 7 Google Fonts, 3 spacing modes, drag-and-drop section ordering, profile photo upload, `localStorage` auto-save (`resume_maker_data`), and JSON import/export intact.
   - Maintain MIT licensing (`LICENSE`) and include subtle attribution in the footer: `"Built on Resume-Maker (MIT) • Tailored with RoleFit"`.

---

## 3. Baseline Codebase Audit
- **`src/types/resume.ts`**: Defines `ResumeData`, `PersonalInfo`, `WorkExperience`, `Education`, `Project`, `TemplateName`, `SpacingOption`, `SectionId`, `DEFAULT_RESUME_DATA`, and `SAMPLE_RESUME_DATA`.
- **`src/context/ResumeContext.tsx`**: Manages `resumeData` state with `localStorage` persistence under `'resume_maker_data'`, field updaters, section reordering, JSON export/import, and sample data loader.
- **`src/app/builder/page.tsx`**: Split-screen workspace (`lg:w-[45%]` left `.editor-panel.no-print`, `lg:w-[55%]` right `ResumePreview`) with a fixed top action toolbar (`no-print`).
- **`src/components/editor/*`**: Accordion form editors (`PersonalInfoForm`, `ExperienceForm`, `ProjectsForm`, `EducationForm`, `SkillsForm`).
- **`src/components/templates/*`**: `ModernTemplate`, `ExecutiveTemplate`, and `MinimalistTemplate` rendered inside `.resume-sheet` (`210mm × 297mm`).
- **`src/app/globals.css`**: Tailwind v4 `@theme` design tokens, glassmorphism utilities, and comprehensive `@media print` rules.

---

## 4. Phased Feature Specification

### Phase 1 — RoleFit Workspace & 1-Click Demo Mode
- **Workspace Mode Switcher (`/builder`):**
  - Add a prominent segmented mode toggle at the top of the left panel in `/builder` (`print:hidden no-print`):
    - **`Edit Resume`** (existing 6 accordion sections for design & content editing)
    - **`RoleFit Tailor`** (dedicated JD tailoring & ATS optimization workspace)
  - Keep the right-hand live A4 PDF preview visible at all times so changes made in `RoleFit Tailor` mode reflect immediately on the resume sheet.
  - Add a live mini score pill on the `RoleFit Tailor` tab button whenever a JD is active.
- **Quick Demo Bar & Student Sample Data:**
  - Add a **"Load Student Sample Resume"** button (plus support `?sample=true` query param on `/builder` via client-side `window.location.search` effect so static export works cleanly) that populates a realistic early-career student resume (*Maya Lin — Computer Science & Business Student* with internship experience, leadership, and technical/product projects). Keep the existing senior sample accessible or switchable.
  - Provide **3 clickable preset Internship JDs** inside the `RoleFit Tailor` panel:
    1. *Product Management Intern* (PRD, Roadmapping, Agile/Scrum, Figma, SQL, A/B Testing, User Research, KPIs, Jira, Cross-Functional Collaboration)
    2. *Software Engineering Intern* (TypeScript, React, Next.js, Node.js, Python, REST APIs, Git, CI/CD, Unit Testing, PostgreSQL, Docker, System Design)
    3. *Business / Data Analyst Intern* (SQL, Python, Tableau, Power BI, Excel, Data Visualization, Statistical Analysis, ETL, Dashboarding, Stakeholder Management)
- **JD Persistence:**
  - Auto-save the active JD text and selected preset role ID to `localStorage` (`rolefit_jd_text`, `rolefit_jd_preset`).

### Phase 2 — Real-Time JD Keyword & Skill Match Engine (`src/lib/rolefit/`)
- **Curated Skill & Competency Dictionary (`src/lib/rolefit/dictionary.ts`):**
  - ~180 curated early-career skills spanning **Software Engineering**, **Product Management**, **Data & Analytics**, **Business & Operations**, and **Design & Tooling**.
  - **Synonym & Alias Normalization:** Canonical skill mapping so variations match accurately (e.g., `JS` / `JavaScript`, `TS` / `TypeScript`, `PM` / `Product Management`, `A/B Testing` / `Split Testing` / `Experimentation`, `Postgres` / `PostgreSQL`, `CI/CD` / `Continuous Integration`, `K8s` / `Kubernetes`, `GA4` / `Google Analytics`, `React.js` / `React`).
  - **High-Frequency JD Term Fallback:** Extract salient multi-word/domain terms from arbitrary pasted JDs even beyond the core dictionary, filtering out common English/HR stopwords.
- **Live Match Analyzer (`src/lib/rolefit/analyzer.ts`):**
  - Scans the entire `ResumeData` object (summary, skills, workExperience positions & bullets, project names/technologies/bullets, education, certifications).
  - Computes:
    - **RoleFit Score (0–100%):** Weighted match score across detected JD keywords, color-coded (`< 50%` Rose/Amber warning, `50–79%` Amber/Cyan improving, `80–100%` Emerald strong fit).
    - **Matched Keywords (Green Badges):** Keywords present in both the JD and the resume, indicating where they were found (`Skills`, `Experience`, `Projects`, `Summary`).
    - **Missing Keywords (Amber Clickable Badges):** Keywords requested by the JD that are missing from the resume, sorted by category/importance.

### Phase 3 — 1-Click Impact-Bullet Inserter & ATS Quick Check
- **Interactive Missing Keyword Action Drawer / Card:**
  - Clicking any amber **Missing Keyword** opens an inline action panel (`print:hidden`) offering:
    1. **`+ Add "[Keyword]" to Skills`:** One-click button that appends the canonical skill directly to `resumeData.skills` (with duplicate prevention) and immediately boosts the RoleFit Score.
    2. **2–3 Student-Ready XYZ / STAR Impact-Bullet Templates:** Dynamically generated for the selected keyword using the Google XYZ formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*).
    3. **Target Entry Selector & `+ Insert Bullet`:** Dropdown to pick any existing **Work Experience** or **Project** entry (or create a quick entry if none exist) and insert the chosen bullet with 1 click.
    4. **Editable Placeholder Reminder:** Clear visual callout reminding the student to replace bracketed `[placeholders]` (e.g., `[X%]`, `[team/feature]`, `[N+ users]`) with their authentic metrics, plus a quick link to jump to that section in `Edit Resume` mode.
- **ATS Quick Check Card (`src/lib/rolefit/atsCheck.ts`):**
  - **Quantified Impact Counter:** Counts how many Experience & Project bullets contain measurable metrics (`%`, `$`, numbers/multipliers like `2x`, `10K+`, `50+`) vs. total bullets, with a target progress bar.
  - **Weak Starter Verb Detector:** Flags bullets starting with passive or weak phrases (`helped`, `worked on`, `responsible for`, `assisted with`, `participated in`, `duties included`, `was tasked with`) and suggests high-impact action verbs (`Architected`, `Spearheaded`, `Engineered`, `Automated`, `Analyzed`, `Optimized`, `Launched`) with a **1-click verb swap** helper.
  - **Completeness Checks:** Checks for essential ATS contact & section signals (email, LinkedIn/GitHub, summary, skills count).

### Phase 4 — Landing Page Branding & Final Build Check
- **Rebrand `/` & Metadata:**
  - Update `src/app/layout.tsx` metadata and `src/app/page.tsx` branding to **RoleFit Resume Tailor** (*"Tailor Your Student Resume to Any Internship JD in 60 Seconds"*).
  - Highlight the **3-Step Student Flow** (`01. Load Your Resume or Student Demo`, `02. Paste Any Internship JD & Check Your RoleFit Score`, `03. Insert XYZ Impact Bullets & Export Clean ATS PDF`).
  - Add footer credit: `"Built on Resume-Maker (MIT) • Tailored with RoleFit"`.
- **Production Build & Print Verification:**
  - Verify `npm run build` succeeds with zero TypeScript or Next.js static export errors.
  - Verify in the browser across all 3 templates (`Modern`, `Executive`, `Minimalist`) that `@media print` hides every RoleFit UI element and exports only the crisp A4 resume.
