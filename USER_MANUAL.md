# RoleFit Resume Tailor — User Manual

**Live Demo URL:** [PASTE_LIVE_URL_HERE]

RoleFit Resume Tailor helps students and early-career applicants tailor their CV to any internship or graduate job description in real time—with a live **RoleFit Score (0–100%)**, 1-click XYZ impact bullets, an **ATS Quick Check**, client-side PDF/DOCX CV upload, and crisp 1- or 2-page A4 PDF export.

---

## Option A — 30-Second Quick Demo (No CV Needed)

1. **Launch Demo Mode:** Open the landing page (`/`) and click **Try Interactive Demo**.
2. **Explore Profiles & Target Role Presets:**
   - Toggle between the two fictional student profiles in the **Quick Demo Mode** bar: **HSG Sample** (*Lukas Weber*) and **Tech Sample** (*Maya Lin*).
   - Switch between the two target-role tracks and click any preset JD to watch the live **RoleFit Score** update:
     - **Business & Finance (HSG):** *Strategy Consulting*, *M&A / IB Analyst*, *VC / PE Intern*, *Founder's Associate*
     - **Tech & Product:** *PM Intern*, *SWE Intern*, *Data / BA Intern*
3. **Close Keyword Gaps in 1 Click:**
   - Click 2–3 amber **Missing Keywords** pills to open the inline action drawer.
   - Click **+ Add to Skills** or pick an Experience/Project entry and click **+ Insert Bullet** to insert a tailored XYZ/STAR impact bullet. Watch the keyword turn green, the RoleFit Score jump, and the A4 preview update immediately.
   - *(Tip: Always replace `[bracketed placeholders]` with your real projects and metrics before exporting.)*
4. **Upgrade Bullets With ATS Quick Check:**
   - Scroll to the **ATS Quick Check** card to inspect quantified-impact coverage, bullet density, and weak starter verbs (e.g., *"Worked on"*, *"Assisted with"*).
   - Click any suggested action-verb chip to rewrite a weak opener in 1 click.
5. **Check Page Fit & Export PDF:**
   - Above the A4 preview on the right, toggle **Target: 1 Page | 2 Pages** to verify page-fit guidance and clean page-break dividers (you can also switch between **Modern**, **Executive**, and **Minimalist** templates under **Edit Resume → 1. Customize Design & Layout**).
   - Click **Export PDF** in the top-right toolbar and choose **Save as PDF** in the browser print dialog for a clean, selectable-text ATS PDF.

---

## Option B — Test With Your Own CV

1. **Open the Importer:** Click **Upload CV (PDF / DOCX)** on the landing page or **Upload CV** in the builder toolbar.
2. **Upload or Paste:**
   - Drag and drop a `.pdf` or `.docx` resume—the parser handles both **US** single-column resumes and **European / DACH / HSG** two-column date-rail CVs (`MM.YYYY` dates, international phone formats, and Swiss GPA scales).
   - Prefer plain text or using a scanned/image-only PDF? Switch to the **Paste CV Text** tab instead.
3. **Review Import Preview:** Inspect the detected counts (Experience, Education, Projects, Skills, Languages) in the **Import Preview** step and click **Apply to Resume** (you can fine-tune any field afterward under **Edit Resume**).
4. **Tailor to Any Real JD:** Switch to **RoleFit Tailor**, paste any job posting into the **Target Job Description** box, and use the live **RoleFit Score**, Missing Keywords drawer, and **ATS Quick Check** to tailor your CV before exporting.
5. **Save Versions Locally:** Use **Backup JSON** / **Import JSON** in the top toolbar to save or switch between role-specific versions of your CV.

---

## Running Locally (Fallback)

Requires **Node.js 20+** and `npm`.

```bash
git clone https://github.com/Mihail1231/Resume-Maker.git
cd Resume-Maker
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.  
*(Optional: run `npm run build` to generate a fully static production export in `out/`, including the local PDF.js worker `out/pdf.worker.min.mjs`.)*

---

## Privacy & Data Handling

- **100% Client-Side:** All CV parsing (`pdfjs-dist` and `mammoth`), keyword matching, and ATS checks run strictly inside your browser.
- **Zero Uploads or Accounts:** No sign-up, no API keys, and no files or personal details are ever sent to an external server.
- **Local Persistence:** Your draft resume and pasted JD auto-save in browser `localStorage` and can be wiped at any time via **Clear All**.

---

## License & Attribution

Built on top of the open-source [`iam-neo/Resume-Maker`](https://github.com/iam-neo/Resume-Maker) repository and distributed under the **MIT License** (see [`LICENSE`](./LICENSE)).
