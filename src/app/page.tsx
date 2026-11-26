import StaticLink from '@/components/ui/StaticLink';
import {
  FileText,
  Sparkles,
  Download,
  Palette,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Target,
  ShieldCheck,
  Wand2,
  Upload,
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Live RoleFit Score (0–100%)',
    description:
      'Paste any job description and watch your match percentage, matched skills, and priority gaps update live as you edit.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Synonym-Aware Skill Engine',
    description:
      'Curated ~175 early-career SWE, PM, Data, and Business skills with alias normalization like JS/JavaScript and PM/Product Management.',
    gradient: 'from-indigo-500 to-violet-400',
  },
  {
    icon: Wand2,
    title: '1-Click XYZ Impact Bullets',
    description:
      'Click any missing keyword to add it to Skills or insert student-ready XYZ/STAR impact bullets directly into your Experience or Projects.',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    icon: ShieldCheck,
    title: 'ATS Quick Check & Verb Swaps',
    description:
      'Count quantified impact bullets (%, $, numbers), check 1-page density, and upgrade weak openers like "Worked on" or "Helped" in 1 click.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Palette,
    title: '3 ATS-Safe Templates',
    description:
      'Switch cleanly between Modern, Executive, and Minimalist A4 layouts with full typography, accent color, spacing, and section ordering.',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    icon: Shield,
    title: '100% Client-Side & Private',
    description:
      'Zero API keys, zero sign-ups, and zero server uploads. Everything runs locally in your browser with auto-save and JSON backups.',
    gradient: 'from-rose-500 to-red-400',
  },
];

const steps = [
  {
    step: '01',
    title: 'Upload Your CV, Load Sample, or Build',
    description:
      'Upload an existing PDF/DOCX resume locally in your browser, launch the student sample (Maya Lin) in one click, or build from scratch.',
  },
  {
    step: '02',
    title: 'Paste a Job Description & Get Live RoleFit Score',
    description:
      'Try one of 7 built-in Business & Tech role presets or paste any job description to reveal matched and missing keywords instantly.',
  },
  {
    step: '03',
    title: 'Insert Impact Bullets & Export Clean ATS PDF',
    description:
      'Add skills and XYZ bullets in 1 click, customize placeholders with your real metrics, upgrade weak verbs, and print a crisp selectable-text A4 PDF.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              RoleFit <span className="text-primary-light">Resume Tailor</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StaticLink href="/builder" className="btn btn-ghost text-sm hidden sm:inline-flex">
              Start From Scratch
            </StaticLink>
            <StaticLink
              href="/builder?sample=true&mode=tailor"
              className="btn btn-primary text-sm"
            >
              Try Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </StaticLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            100% Client-Side &middot; Zero API Keys &middot; ATS-Ready PDF
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Tailor Your Resume
            <br />
            <span className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent">
              to Any Job Description
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Built for students and new grads. Paste any SWE, PM, or Data Analyst internship job
            description, check your live RoleFit Score, insert XYZ impact bullets in 1 click, and
            export a crisp, selectable-text A4 PDF — completely free and private.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-3.5 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <StaticLink
              href="/builder?sample=true&mode=tailor"
              className="btn btn-primary text-base px-7 py-3 animate-pulse-glow"
            >
              <Target className="w-5 h-5" />
              Try Interactive Demo
              <ArrowRight className="w-5 h-5" />
            </StaticLink>
            <StaticLink
              href="/builder?import=true"
              className="btn text-base px-7 py-3 bg-accent/15 text-accent border border-accent/35 hover:bg-accent/25"
            >
              <Upload className="w-5 h-5" />
              Upload CV (PDF / DOCX)
            </StaticLink>
            <StaticLink href="/builder" className="btn btn-ghost text-base px-7 py-3">
              <FileText className="w-5 h-5" />
              Start From Scratch
            </StaticLink>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Built to Pass Student &amp; Internship ATS Screens
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Real-time job description keyword matching paired with a clean split-screen resume
              studio — no paywalls, no data harvesting, and no broken PDF formatting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl bg-surface-light border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className={`w-11 h-11 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Student Flow */}
      <section className="py-24 px-6 bg-surface-light/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              The 3-Step Student Tailoring Flow
            </h2>
            <p className="text-text-secondary text-lg">
              Go from generic resume to role-tailored, ATS-ready A4 PDF in under 5 minutes.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-light to-accent/10 border border-border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Boost Your Internship Match Score?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
              Launch the interactive demo with sample student resumes and 7 preset job
              descriptions, or start crafting your own resume from scratch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <StaticLink
                href="/builder?sample=true&mode=tailor"
                className="btn btn-primary text-base px-7 py-3.5"
              >
                <Zap className="w-5 h-5" />
                Try Interactive Demo
                <ArrowRight className="w-5 h-5" />
              </StaticLink>
              <StaticLink
                href="/builder?import=true"
                className="btn text-base px-7 py-3.5 bg-accent/15 text-accent border border-accent/35 hover:bg-accent/25"
              >
                <Upload className="w-5 h-5" />
                Upload Existing CV
              </StaticLink>
              <StaticLink href="/builder" className="btn btn-ghost text-base px-7 py-3.5">
                <Download className="w-5 h-5" />
                Start From Scratch
              </StaticLink>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> 100% browser-local
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> Zero API keys
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> Clean A4 ATS PDF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border no-print print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-light" />
            <span className="font-medium text-text-secondary">RoleFit Resume Tailor</span>
          </div>
          <p>Built on Resume-Maker (MIT) &bull; Tailored with RoleFit</p>
        </div>
      </footer>
    </div>
  );
}
