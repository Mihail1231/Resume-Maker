import { ResumeData } from '@/types/resume';

export type PresetTrackGroup = 'business' | 'tech';

export interface PresetJD {
  id: string;
  label: string;
  shortLabel: string;
  company: string;
  location: string;
  trackGroup: PresetTrackGroup;
  roleTrack: 'consulting' | 'finance' | 'vc' | 'gtm' | 'pm' | 'swe' | 'data';
  description: string;
}

export const STUDENT_SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Maya Lin',
    jobTitle: 'CS & Business Undergraduate | Seeking Summer Internship',
    email: 'maya.lin@uw.edu',
    phone: '(206) 555-0194',
    location: 'Seattle, WA',
    website: 'mayalin.dev',
    linkedin: 'linkedin.com/in/mayalin-uw',
    github: 'github.com/mayalin-dev',
  },
  summary:
    'Junior Computer Science & Business Administration student passionate about building user-centric web products and turning raw data into clear decisions. Experienced in Python, JavaScript, React, SQL, and Figma through campus product fellowships, operations analysis, and student team projects.',
  workExperience: [
    {
      id: 'student-exp-1',
      company: 'Husky Tech & Product Club',
      position: 'Product & Engineering Fellow',
      location: 'Seattle, WA',
      startDate: '2025-09',
      endDate: '',
      current: true,
      description: [
        'Worked on a campus course-planner web app using React and JavaScript for student enrollment workflows.',
        'Helped conduct user research surveys with 40+ undergraduates and collaborated with designers in Figma during Agile sprints.',
        'Maintained shared project tasks and documentation in Git to support cross-functional engineering and design peers.',
      ],
    },
    {
      id: 'student-exp-2',
      company: 'UW Campus Dining Services',
      position: 'Operations & Data Assistant',
      location: 'Seattle, WA',
      startDate: '2025-06',
      endDate: '2025-08',
      current: false,
      description: [
        'Analyzed weekly meal-swipe transaction logs in SQL and Excel to identify peak dining traffic trends across 3 halls.',
        'Responsible for updating weekly inventory spreadsheets and creating data visualization summaries for dining managers.',
      ],
    },
  ],
  education: [
    {
      id: 'student-edu-1',
      school: 'University of Washington',
      degree: 'B.S. in Computer Science & Business Administration',
      location: 'Seattle, WA',
      startDate: '2023-09',
      endDate: '2027-06',
      current: true,
      gpa: '3.78 / 4.0',
      description:
        "Dean's List (5 Quarters) • Relevant Coursework: Data Structures, Database Systems, Web Programming, Business Statistics",
    },
  ],
  projects: [
    {
      id: 'student-proj-1',
      name: 'StudyBuddy Course Matcher',
      role: 'Frontend & Product Lead',
      technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Figma', 'Git'],
      githubLink: 'github.com/mayalin-dev/studybuddy',
      liveLink: 'studybuddy-uw.vercel.app',
      description: [
        'Built a responsive study-group discovery web prototype in React, HTML, and CSS based on user interviews with 25 students.',
        'Designed low-fidelity layouts in Figma to streamline onboarding flows and incorporate early user feedback.',
      ],
    },
    {
      id: 'student-proj-2',
      name: 'Retail Sales Insights Notebook',
      role: 'Data Project Contributor',
      technologies: ['Python', 'SQL', 'Excel'],
      githubLink: 'github.com/mayalin-dev/retail-sales-insights',
      liveLink: '',
      description: [
        'Cleaned and queried a 12,000-row public retail dataset using Python and SQL to highlight seasonal sales patterns.',
        'Created clear charts and written communication summaries identifying top-performing product categories.',
      ],
    },
  ],
  skills: [
    'Python',
    'JavaScript',
    'React',
    'SQL',
    'Excel',
    'Figma',
    'Git',
    'HTML',
    'CSS',
    'Agile',
    'User Research',
    'Data Visualization',
  ],
  languages: ['English (Native)', 'Mandarin (Conversational)'],
  certifications: ['Google Data Analytics Certificate (In Progress)'],
  themeColor: '#2563eb',
  fontFamily: 'Inter',
  spacing: 'normal',
  template: 'modern',
  sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'languages', 'certifications'],
};

/**
 * Fictional Business / HSG student persona (Lukas Weber) so business-school
 * users can test Consulting, M&A/IB, VC/PE, and Founder's Associate presets in 1 click.
 */
export const BUSINESS_SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Lukas Weber',
    jobTitle: 'M.A. Business Innovation Candidate (HSG) | Strategy, Finance & Growth',
    email: 'lukas.weber@example-unisg.ch',
    phone: '+41 79 555 01 42',
    location: 'Zurich, Switzerland',
    website: '',
    linkedin: 'linkedin.com/in/lukas-weber-hsg',
    github: '',
  },
  summary:
    'Analytical Master student in Business Innovation at the University of St. Gallen (HSG) with internship experience in B2B fintech growth, corporate finance analysis, and student consulting projects across the DACH region.',
  workExperience: [
    {
      id: 'biz-exp-1',
      company: 'HelvetiaPay AG',
      position: 'Strategy & Business Development Intern',
      location: 'Zurich, Switzerland',
      startDate: '2025-07',
      endDate: '2025-12',
      current: false,
      description: [
        'Worked on DACH market sizing and competitive benchmarking across 18 B2B payment providers to support senior management decisions.',
        'Built PowerPoint pitch decks and Excel financial models evaluating a CHF 4.2M merchant expansion business case.',
        'Coordinated stakeholder management and CRM-based B2B outreach in HubSpot, lifting qualified partner leads by 22%.',
      ],
    },
    {
      id: 'biz-exp-2',
      company: 'AlpenRetail Group',
      position: 'Corporate Finance Working Student',
      location: 'Basel, Switzerland',
      startDate: '2024-09',
      endDate: '2025-05',
      current: false,
      description: [
        'Helped prepare monthly P&L variance reporting and Excel modeling summaries for 6 European business units.',
        'Responsible for maintaining competitor valuation trackers and basic corporate finance research notes.',
      ],
    },
  ],
  education: [
    {
      id: 'biz-edu-1',
      school: 'University of St. Gallen (HSG)',
      degree: 'M.A. HSG in Business Innovation',
      location: 'St. Gallen, Switzerland',
      startDate: '2025-09',
      endDate: '2027-06',
      current: true,
      gpa: '5.40/6.0',
      description: 'Focus: Digital Strategy, Venture Building & AI Business Models',
    },
    {
      id: 'biz-edu-2',
      school: 'University of St. Gallen (HSG)',
      degree: 'B.A. HSG in Business Administration',
      location: 'St. Gallen, Switzerland',
      startDate: '2022-09',
      endDate: '2025-07',
      current: false,
      gpa: '5.25/6.0',
      description: 'Exchange semester at Rotterdam School of Management • Corporate Finance & Strategy',
    },
  ],
  projects: [
    {
      id: 'biz-proj-1',
      name: 'HSG Student Consulting Initiative',
      role: 'Project Lead',
      technologies: ['PowerPoint', 'Excel', 'Market Sizing', 'Business Case'],
      description: [
        'Led a 4-student consulting team delivering a go-to-market pricing study for a Swiss SaaS startup with 120+ SME customers.',
        'Synthesized 15 customer interviews into structured executive recommendations adopted by the founding team.',
      ],
    },
  ],
  skills: [
    'Excel Modeling',
    'PowerPoint',
    'Market Sizing',
    'Financial Modeling',
    'Business Development',
    'Go-To-Market',
    'HubSpot',
    'Stakeholder Management',
    'Competitive Benchmarking',
    'Business Case',
    'Python',
    'SQL',
  ],
  languages: ['German (Native)', 'English (C2 Fluent)', 'French (B2 Conversational)'],
  certifications: ['Bloomberg Market Concepts (BMC)'],
  themeColor: '#1e3a8a',
  fontFamily: 'Inter',
  spacing: 'normal',
  template: 'executive',
  sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'languages', 'certifications'],
};

export const PRESET_INTERNSHIP_JDS: PresetJD[] = [
  // =========================================================================
  // BUSINESS & FINANCE (HSG TRACKS)
  // =========================================================================
  {
    id: 'consulting-intern',
    label: 'Strategy & Management Consulting Intern (MBB / Tier-1)',
    shortLabel: 'Strategy Consulting',
    company: 'Helvetia Strategy Partners (MBB / Tier-1)',
    location: 'Zurich / Munich',
    trackGroup: 'business',
    roleTrack: 'consulting',
    description: `Role: Visiting Associate / Strategy & Management Consulting Intern (DACH)
Company: Helvetia Strategy Partners

About the Role:
Join our Zurich and Munich teams to advise C-level executives on high-stakes Strategy Consulting, Digital Transformation, and Commercial Due Diligence engagements across Europe.

What You'll Do:
- Apply MECE structures and Hypothesis-Driven Problem Solving to break down ambiguous Market Entry and Growth Strategy questions.
- Conduct bottom-up Market Sizing, Competitive Benchmarking, and Business Case modeling in Excel.
- Support Commercial Due Diligence (CDD), Operating Model redesign, and Post-Merger Integration (PMI) workstreams.
- Build board-ready Slide Storylining deliverables in PowerPoint and Think-Cell for C-Level Communication.
- Co-facilitate Client Workshops and manage Stakeholder Management across senior client workstreams.

Qualifications:
- Top-tier Bachelor or Master candidate (e.g. HSG, ETH, WHU, LSE) with strong analytical excellence.
- Demonstrated experience in Management Consulting, Excel Modeling, PowerPoint, and Change Management.
- Crisp structured communication and Value Creation mindset.`,
  },
  {
    id: 'ib-ma-intern',
    label: 'M&A / Investment Banking Analyst Intern',
    shortLabel: 'M&A / IB Analyst',
    company: 'AlpenBridge Advisory',
    location: 'Zurich / Frankfurt',
    trackGroup: 'business',
    roleTrack: 'finance',
    description: `Role: M&A / Investment Banking Off-Cycle Analyst Intern (DACH)
Company: AlpenBridge Advisory

About the Role:
Work directly with Directors and Managing Directors on mid-cap and large-cap M&A advisory, sell-side divestitures, and Corporate Finance transactions across the DACH region.

What You'll Do:
- Build dynamic 3-statement Financial Modeling, DCF Modeling, and LBO Modeling workbooks in Excel Modeling.
- Run Valuation analyses including Trading Comps (CCA) and Transaction Comps (Precedent Transactions) using Capital IQ, Bloomberg, and FactSet.
- Prepare client Pitchbooks, teasers, and Information Memorandum (IM) documents in PowerPoint and Think-Cell.
- Coordinate Due Diligence (VDR Q&A) and support live Deal Execution alongside legal and accounting advisors.
- Analyze historical financials under Financial Accounting / IFRS standards to identify EBITDA adjustments and synergies.

Qualifications:
- Pursuing a Bachelor or Master in Finance, Business Administration, or Economics with strong academic standing.
- Hands-on command of M&A valuation, Corporate Finance, Excel, and PowerPoint.`,
  },
  {
    id: 'vc-pe-intern',
    label: 'Venture Capital / Private Equity Intern',
    shortLabel: 'VC / PE Intern',
    company: 'Helios Growth Ventures',
    location: 'Zurich / Berlin',
    trackGroup: 'business',
    roleTrack: 'vc',
    description: `Role: Venture Capital & Growth Private Equity Visiting Analyst
Company: Helios Growth Ventures

About the Role:
Partner with our Zurich and Berlin investment teams backing Series A–C European B2B SaaS and AI category leaders, as well as growth buyout opportunities.

What You'll Do:
- Drive proactive Deal Sourcing and Startup Scouting across DACH and European tech ecosystems, tracking opportunities in CRM.
- Author structured Investment Memo (IC Memo) deep dives covering Market Sizing, Market Mapping, and Competitive Benchmarking.
- Analyze B2B SaaS Unit Economics (ARR, LTV/CAC, churn), Cap Table & Term Sheets, and Valuation / LBO Modeling scenarios.
- Support Commercial Due Diligence (CDD), founder reference calls, and Financial Modeling during live transactions.
- Assist with Portfolio Value Creation initiatives spanning Go-To-Market strategy and executive reporting.

Qualifications:
- Entrepreneurial Bachelor/Master student passionate about Venture Capital, Private Equity, and B2B SaaS.
- Strong analytical foundation in Excel Modeling, Financial Modeling, and crisp C-Level Communication.`,
  },
  {
    id: 'founders-associate-intern',
    label: "Founder's Associate — Strategy, GTM & AI",
    shortLabel: "Founder's Associate",
    company: 'ScaleFlow AI',
    location: 'Zurich / St. Gallen',
    trackGroup: 'business',
    roleTrack: 'gtm',
    description: `Role: Founder's Associate Intern — Strategy, GTM & AI Transformation
Company: ScaleFlow AI

About the Role:
Act as the right hand to our CEO & Co-Founders at a fast-growing Swiss B2B AI startup, driving Go-To-Market execution, strategic partnerships, and internal AI workflow automation.

What You'll Do:
- Own Go-To-Market (GTM) experiments, Ideal Customer Profile (ICP) refinement, Positioning & Messaging, and Pricing Strategy.
- Execute structured B2B Outreach, Sales Funnel Management, and CRM automation in HubSpot / Pipedrive.
- Lead Market Validation, Partnership Development, and Business Model Innovation projects directly with founders.
- Design and deploy internal AI Workflow Design, LLM Prototyping, and Agentic AI / No-Code / Low-Code automations to scale operations.
- Prepare investor Pitchbooks, board updates, and KPIs dashboards with crisp C-Level Communication and Stakeholder Management.

Qualifications:
- High-ownership Business Innovation, Strategy, or Tech student excited by early-stage Business Development and Generative AI / LLMs.
- Bonus: Experience with Design Thinking, Data Visualization, or SQL.`,
  },

  // =========================================================================
  // TECH & PRODUCT TRACKS
  // =========================================================================
  {
    id: 'pm-intern',
    label: 'Product Management Intern',
    shortLabel: 'PM Intern',
    company: 'CloudPulse',
    location: 'Seattle, WA / Hybrid',
    trackGroup: 'tech',
    roleTrack: 'pm',
    description: `Role: Product Management Intern (Summer 2027)
Company: CloudPulse

About the Role:
We are looking for an analytical, user-focused Product Management Intern to partner with engineering, design, and data teams on our core customer onboarding experience.

What You'll Do:
- Author clear PRDs and User Stories with crisp acceptance criteria for upcoming feature releases.
- Collaborate with a cross-functional team in Agile and Scrum sprints, organizing tasks in Jira.
- Conduct User Research, customer interviews, and Competitive Analysis to uncover high-impact workflow gaps.
- Partner with designers in Figma on Wireframing to validate concepts early with users.
- Query product usage in SQL, monitor key KPIs, and run A/B Testing experiments to improve onboarding.
- Support Product Roadmap planning, Go-To-Market launch checklists, and Stakeholder Management updates.

Qualifications:
- Currently pursuing a BS/BA in Computer Science, Business, Economics, HCI, or a related field.
- Strong communication skills and genuine Customer Empathy for end-user workflows.
- Hands-on familiarity with SQL, Figma, and Data Visualization.`,
  },
  {
    id: 'swe-intern',
    label: 'Software Engineering Intern',
    shortLabel: 'SWE Intern',
    company: 'NovaStack Technologies',
    location: 'San Francisco, CA / Remote',
    trackGroup: 'tech',
    roleTrack: 'swe',
    description: `Role: Software Engineering Intern — Full Stack (Summer 2027)
Company: NovaStack Technologies

About the Role:
Join NovaStack's Core Platform team to build fast, dependable developer web tools used by thousands of teams every day.

What You'll Do:
- Build clean, responsive web interfaces using React, TypeScript, Next.js, HTML, and CSS.
- Design and implement reliable REST APIs and backend services with Node.js, Python, and PostgreSQL.
- Write maintainable code backed by Unit Testing (Jest / Pytest) and constructive Code Review feedback.
- Containerize services with Docker and contribute to automated CI/CD pipelines using Git.
- Participate in Agile team planning and collaborative System Design reviews.

Qualifications:
- Pursuing a BS/MS in Computer Science, Software Engineering, or equivalent technical experience.
- Solid foundation in Data Structures & Algorithms, JavaScript, TypeScript, and SQL.
- Experience building web apps with React, Next.js, REST APIs, and PostgreSQL.
- Bonus: Exposure to AWS or Docker.`,
  },
  {
    id: 'analyst-intern',
    label: 'Business / Data Analyst Intern',
    shortLabel: 'Data / BA Intern',
    company: 'NorthStar Retail Analytics',
    location: 'New York, NY / Hybrid',
    trackGroup: 'tech',
    roleTrack: 'data',
    description: `Role: Business & Data Analyst Intern (Summer 2027)
Company: NorthStar Retail Analytics

About the Role:
Work alongside our Commercial Analytics team to transform customer and store data into clear executive recommendations.

What You'll Do:
- Write SQL queries and Python scripts to extract, perform Data Cleaning on, and analyze multi-million-row datasets.
- Build interactive Tableau and Power BI dashboards to monitor weekly KPIs and regional performance.
- Maintain automated Reporting workflows and support ETL pipelines in Snowflake.
- Run Statistical Analysis, Forecasting, and A/B Testing evaluations to measure seasonal promotions.
- Use Excel (including Pivot Tables) to prepare ad-hoc analyses and concise executive summaries.
- Partner closely on Stakeholder Management, translating Data Visualization insights with clear communication.

Qualifications:
- Pursuing an undergraduate degree in Data Science, Business Analytics, Statistics, Economics, or Computer Science.
- Hands-on experience with SQL, Excel, Python, and Data Analysis.
- Familiarity with Tableau, Power BI, and Dashboarding best practices.`,
  },
];
