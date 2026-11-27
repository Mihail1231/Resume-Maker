# RoleFit Resume Tailor

**Live Demo URL:** https://rolefit-resume-tailor.vercel.app/  
**Quick Walkthrough:** See [`USER_MANUAL.md`](./USER_MANUAL.md) for a 30-second guided demo and CV upload instructions.

RoleFit Resume Tailor is a **100% client-side** resume tailoring studio built for university students and early-career applicants. Upload your existing PDF/DOCX CV (or load a built-in demo profile), paste any job description, inspect your live **RoleFit Match Score (0–100%)**, insert tailored **XYZ / STAR impact bullets** in 1 click, run an **ATS Quick Check**, and export a crisp, selectable-text **1-page or 2-page A4 PDF**—with zero sign-up, zero API keys, and zero server uploads.

---

## Key Features

### Live Job Description Match Engine
- **Real-Time RoleFit Score (0–100%):** Paste any job description to calculate keyword coverage instantly as you edit.
- **~275-Skill Synonym-Aware Dictionary:** Recognizes early-career Business, Finance, Consulting, VC/PE, Go-To-Market, Software Engineering, Product Management, Data, and Design skills—with alias normalization (e.g., `DCF` / `DCF Modeling`, `M&A` / `Mergers & Acquisitions`, `JS` / `JavaScript`, `A/B Testing` / `Split Testing`).
- **Curated Target-Role Presets & Demo Profiles:**
  - **Business & Finance (HSG):** *Strategy Consulting*, *M&A / IB Analyst*, *VC / PE Intern*, *Founder's Associate* — paired with fictional HSG student sample **Lukas Weber**.
  - **Tech & Product:** *PM Intern*, *SWE Intern*, *Data / BA Intern* — paired with fictional tech student sample **Maya Lin**.

### 1-Click Tailoring & ATS Quick Check
- **Interactive Missing-Keyword Drawer:** Click any amber missing keyword to add it directly to **Skills** or insert 2–3 category-tailored **XYZ / STAR impact bullet** templates into any Experience or Project entry (with clear `[bracketed placeholder]` reminders so applicants replace placeholders with authentic metrics).
- **ATS Quick Check:** Measures quantified-impact bullet coverage (including European formats such as `CHF 4.2M` and Swiss GPAs), tracks 1-page word/bullet density, and flags weak starter verbs (*"Worked on"*, *"Helped"*, *"Responsible for"*) with **1-click strong-verb upgrades**.

### 100% Client-Side PDF & DOCX CV Upload
- **Zero-Upload Local Parsing:** Uses `pdfjs-dist` (with a self-hosted local worker at `public/pdf.worker.min.mjs`) and `mammoth` strictly inside the browser—your CV never leaves your device.
- **US & European / DACH / HSG Layout Support:** Handles standard US single-column resumes as well as European/DACH two-column date-rail CVs (`MM.YYYY` dates, international phone formats, pipe-delimited headers, and Swiss GPA scales).
- **Import Preview & Paste Fallback:** Review detected sections before applying, or use the **Paste CV Text** tab for scanned/image-only PDFs.

### ATS-Safe A4 Templates & Export
- **3 Clean Templates:** **Modern**, **Executive**, and **Minimalist**—all supporting 8 accent color swatches + custom HEX picker, **7 self-hosted Google Fonts** (`Inter`, `Outfit`, `Plus Jakarta Sans`, `Lora`, `Playfair Display`, `Merriweather`, `Roboto Mono`), 3 spacing modes (*Compact*, *Normal*, *Relaxed*), drag-and-drop section ordering, and an optional **Show Profile Photo** toggle.
- **1 Page | 2 Pages A4 Target Toggle:** Live height measurement with A4 `297mm` boundary guides and clean `break-inside: avoid` / `break-after: avoid` `@media print` rules for crisp selectable-text PDF export.
- **Local Auto-Save & JSON Backup:** Persists drafts in browser `localStorage` with 1-click **Backup JSON** / **Import JSON** and **Clear All**.

---

## Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.7` | App Router + static export (`output: 'export'`) |
| **React** | `19.2.4` | Interactive split-screen builder UI |
| **TypeScript** | `5.x` | Type-safe matching, parsing, and resume models |
| **Tailwind CSS** | `4.x` | Design tokens, layered component styling, print isolation |
| **Lucide React** | `1.17.0` | UI and resume icons |
| **pdfjs-dist** | `6.5.x` | Client-side PDF text & spatial coordinate extraction |
| **mammoth** | `1.13.x` | Client-side `.docx` text extraction |

---

## Project Structure

```text
├── USER_MANUAL.md                     # Quick-start demo & CV upload guide
├── LICENSE                            # MIT License with upstream attribution
├── public/
│   └── pdf.worker.min.mjs             # Self-hosted PDF.js worker (zero CDN calls)
├── scripts/
│   └── copy-pdf-worker.mjs            # postinstall sync for PDF.js worker
└── src/
    ├── app/
    │   ├── page.tsx                   # RoleFit landing page
    │   ├── builder/page.tsx           # Split-screen Edit Resume / RoleFit Tailor workspace
    │   ├── layout.tsx                 # Self-hosted Google Fonts (next/font/google) & metadata
    │   └── globals.css                # Tailwind v4 layers & @media print rules
    ├── components/
    │   ├── editor/                    # PersonalInfo, Experience, Projects, Education, Skills forms
    │   ├── preview/ResumePreview.tsx  # Live A4 sheet, zoom, 1-Page / 2-Page fit tracker
    │   ├── rolefit/                   # RoleFitPanel & CvImportModal (PDF/DOCX/Paste)
    │   ├── templates/                 # Modern, Executive, and Minimalist A4 templates
    │   └── ui/StaticLink.tsx          # Static-export-safe navigation link
    ├── context/ResumeContext.tsx      # State management, localStorage, JSON backup/import
    ├── lib/rolefit/                   # dictionary, analyzer, bulletTemplates, atsCheck,
    │                                  # fileExtractors, cvParser, demoData
    └── types/resume.ts                # Core TypeScript models
```

---

## Running Locally

Requires **Node.js 20+** and `npm`.

```bash
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### Static Production Export

This project is configured with `output: 'export'` in `next.config.ts` for static hosting (Vercel, GitHub Pages, etc.):

```bash
npm run build
```

The compiled static site is generated in `out/` (including `out/pdf.worker.min.mjs` and all self-hosted `.woff2` fonts). To preview the static build locally:

```bash
npx serve out -l 4173
```

---

## Open-Source Foundation & Attribution

RoleFit Resume Tailor is built on top of the open-source [`iam-neo/Resume-Maker`](https://github.com/iam-neo/Resume-Maker) project under the **MIT License** (see [`LICENSE`](./LICENSE)).

- **From `iam-neo/Resume-Maker` (MIT base):** Next.js 16 / React 19 / Tailwind CSS v4 project shell, split-screen builder layout, accordion editor forms (`PersonalInfoForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsForm`), `ResumeContext` state & JSON backup/import, foundational `Modern`/`Executive`/`Minimalist` templates, and `@media print` A4 printing pattern.
- **Built for RoleFit Resume Tailor:** Real-time Job Description keyword & synonym match engine (`src/lib/rolefit/dictionary.ts`, `analyzer.ts`), 1-click XYZ/STAR impact-bullet inserter (`bulletTemplates.ts`), ATS Quick Check & 1-click weak-verb rewriter (`atsCheck.ts`), 100% client-side PDF/DOCX CV upload & DACH/HSG two-column date-rail parser (`fileExtractors.ts`, `cvParser.ts`, `CvImportModal.tsx`), RoleFit Tailor workspace & HSG/Tech demo presets (`RoleFitPanel.tsx`, `demoData.ts`), compact 1-page / 2-page A4 target toggle with clean multi-page print breaks, self-hosted `next/font/google` typography, Tailwind v4 `@layer` styling fixes, and static-export link handling (`StaticLink.tsx`).

---

## Privacy

All CV file parsing, Job Description matching, and ATS checks execute **100% locally in your browser**. No resume files, personal information, or job descriptions are ever transmitted to a server.
