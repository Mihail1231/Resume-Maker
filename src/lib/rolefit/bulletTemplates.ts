import { SkillCategory } from './dictionary';

export interface BulletTemplate {
  id: string;
  tag: string;
  text: string;
}

/**
 * Curated student-ready XYZ / STAR impact-bullet templates for high-frequency
 * internship skills. Every bullet naturally embeds the exact canonical keyword
 * so inserting it immediately boosts the live RoleFit Match Score.
 */
const SPECIFIC_TEMPLATES: Record<string, Array<{ tag: string; text: string }>> = {
  TypeScript: [
    {
      tag: 'XYZ Impact',
      text: 'Migrated [core frontend modules] to TypeScript with strict typing, reducing runtime bugs by [X%] across [N+ components].',
    },
    {
      tag: 'Project Delivery',
      text: 'Built a full-stack [web app/feature] in TypeScript and React, cutting UI state defects by [X%] during [sprint/hackathon].',
    },
    {
      tag: 'Code Quality',
      text: 'Defined shared TypeScript interfaces between frontend and API layers, speeding up feature onboarding for [N] teammates.',
    },
  ],
  'Next.js': [
    {
      tag: 'XYZ Impact',
      text: 'Engineered a responsive [web application] using Next.js and server-rendered routes, improving page load speed by [X%].',
    },
    {
      tag: 'Project Delivery',
      text: 'Architected reusable App Router layouts and dynamic routes in Next.js, serving [N+ active student users].',
    },
    {
      tag: 'Optimization',
      text: 'Optimized images, metadata, and client bundles in Next.js, raising Lighthouse performance scores from [X] to [Y].',
    },
  ],
  'Node.js': [
    {
      tag: 'XYZ Impact',
      text: 'Developed scalable backend services in Node.js handling [N+ daily requests], reducing average API response latency by [X%].',
    },
    {
      tag: 'Project Delivery',
      text: 'Built authentication, validation, and webhook handlers in Node.js to automate [core workflow] for [N+ users].',
    },
    {
      tag: 'Reliability',
      text: 'Refactored asynchronous I/O and error-handling middleware in Node.js, improving service reliability to [99.X%].',
    },
  ],
  'REST APIs': [
    {
      tag: 'XYZ Impact',
      text: 'Designed and documented [N] REST APIs with structured validation and pagination, reducing client fetch times by [X%].',
    },
    {
      tag: 'Integration',
      text: 'Integrated third-party REST APIs to sync [real-time data/events], eliminating [X hours/week] of manual updates.',
    },
    {
      tag: 'Testing',
      text: 'Implemented error handling and automated integration tests for REST APIs, preventing [X%] of regression issues before release.',
    },
  ],
  PostgreSQL: [
    {
      tag: 'XYZ Impact',
      text: 'Modeled normalized relational schemas and composite indexes in PostgreSQL, accelerating analytical queries by [X%].',
    },
    {
      tag: 'Project Delivery',
      text: 'Built persistent data storage for [project/app] using PostgreSQL, reliably managing [N+ records] across [M] tables.',
    },
    {
      tag: 'Data Integrity',
      text: 'Authored database migrations and foreign-key constraints in PostgreSQL to guarantee data consistency across [feature].',
    },
  ],
  Docker: [
    {
      tag: 'XYZ Impact',
      text: 'Containerized frontend, API, and database services with Docker, cutting teammate environment setup time from [X hours] to [Y minutes].',
    },
    {
      tag: 'DevOps',
      text: 'Created multi-stage Docker images for [project/service], shrinking deployment bundle size by [X%].',
    },
    {
      tag: 'Consistency',
      text: 'Standardized local development and testing parity across [N] engineers using Docker Compose.',
    },
  ],
  'CI/CD': [
    {
      tag: 'XYZ Impact',
      text: 'Configured automated CI/CD workflows (lint, type-check, and tests on every pull request), cutting integration bugs by [X%].',
    },
    {
      tag: 'Release Velocity',
      text: 'Automated preview and production deployments via CI/CD pipelines, reducing release cycle time from [X days] to [Y minutes].',
    },
    {
      tag: 'Collaboration',
      text: 'Enforced automated build checks in CI/CD across [N] contributors to maintain a clean main branch.',
    },
  ],
  'Unit Testing': [
    {
      tag: 'XYZ Impact',
      text: 'Wrote comprehensive Unit Testing suites covering [core business logic], increasing automated code coverage from [X%] to [Y%].',
    },
    {
      tag: 'Reliability',
      text: 'Added edge-case Unit Testing for [API endpoints/utilities], catching [N] critical regressions prior to deployment.',
    },
    {
      tag: 'Engineering Rigor',
      text: 'Adopted test-driven Unit Testing practices during [course/club project], cutting post-merge bug fixes by [X%].',
    },
  ],
  AWS: [
    {
      tag: 'XYZ Impact',
      text: 'Deployed [web service/data pipeline] on AWS (S3, Lambda, EC2), supporting [N+ users] while staying under [$X/month].',
    },
    {
      tag: 'Cloud Storage',
      text: 'Automated static asset delivery and backups on AWS, improving media load times by [X%].',
    },
    {
      tag: 'Monitoring',
      text: 'Configured IAM roles and CloudWatch alerts in AWS to track uptime and diagnose latency spikes in [project].',
    },
  ],
  'System Design': [
    {
      tag: 'Architecture',
      text: 'Collaborated on System Design specs (API contracts, caching, and schema trade-offs) for [feature] supporting [N+ concurrent users].',
    },
    {
      tag: 'Scalability',
      text: 'Evaluated System Design bottlenecks in [project], introducing caching/indexing that lowered peak latency by [X%].',
    },
    {
      tag: 'Documentation',
      text: 'Authored architecture diagrams and System Design decision logs to align [N] engineering teammates before implementation.',
    },
  ],
  'Product Management': [
    {
      tag: 'XYZ Impact',
      text: 'Led end-to-end Product Management discovery and scoping for [feature], lifting student adoption by [X%] across [N+ users].',
    },
    {
      tag: 'Cross-Functional',
      text: 'Applied Product Management frameworks (RICE prioritization, user journeys) to ship [N] high-impact releases with [M] engineers.',
    },
    {
      tag: 'Strategy',
      text: 'Synthesized user feedback and usage metrics into a Product Management pitch deck presented to [club/faculty stakeholders].',
    },
  ],
  PRD: [
    {
      tag: 'XYZ Impact',
      text: 'Authored a detailed PRD defining scope, edge cases, and success metrics for [feature], cutting engineering rework by [X%].',
    },
    {
      tag: 'Alignment',
      text: 'Translated findings from [N] user interviews into a structured PRD reviewed by [design and engineering leads].',
    },
    {
      tag: 'Execution',
      text: 'Partnered with [N] developers to break a PRD into sprint-ready deliverables shipped [X weeks] ahead of schedule.',
    },
  ],
  'Product Roadmap': [
    {
      tag: 'XYZ Impact',
      text: 'Co-owned a quarterly Product Roadmap prioritizing [N] user-requested features, driving a [X%] gain in active engagement.',
    },
    {
      tag: 'Prioritization',
      text: 'Balanced technical debt and user impact on the Product Roadmap using effort-vs-value scoring across [M] workstreams.',
    },
    {
      tag: 'Communication',
      text: 'Maintained a transparent Product Roadmap with clear milestone dates to keep [N] cross-functional teammates aligned.',
    },
  ],
  'A/B Testing': [
    {
      tag: 'XYZ Impact',
      text: 'Designed and evaluated A/B Testing experiments on [onboarding/CTA flow] across [N+ users], improving conversion by [X%].',
    },
    {
      tag: 'Experimentation',
      text: 'Defined control/variant hypotheses, sample sizes, and guardrails for A/B Testing to validate [product change] with statistical rigor.',
    },
    {
      tag: 'Data-Driven',
      text: 'Analyzed A/B Testing funnel drop-offs in SQL and recommended UI refinements that lifted task completion by [X%].',
    },
  ],
  'User Stories': [
    {
      tag: 'Agile Delivery',
      text: 'Authored [N+] clear User Stories with testable acceptance criteria, reducing sprint ambiguity and speeding up QA sign-off by [X%].',
    },
    {
      tag: 'User Focus',
      text: 'Converted raw student interview notes into prioritized User Stories mapped to key onboarding pain points.',
    },
    {
      tag: 'Collaboration',
      text: 'Refined User Stories during weekly grooming sessions with [N] engineers and designers to ensure accurate sprint estimates.',
    },
  ],
  Jira: [
    {
      tag: 'Sprint Execution',
      text: 'Managed sprint backlogs, ticket workflows, and velocity tracking in Jira across a [N]-person cross-functional team.',
    },
    {
      tag: 'Visibility',
      text: 'Structured epics, bugs, and release milestones in Jira, improving on-time sprint completion from [X%] to [Y%].',
    },
    {
      tag: 'Coordination',
      text: 'Triaged [N+] user-reported issues in Jira with clear reproduction steps and priority labels for engineering review.',
    },
  ],
  KPIs: [
    {
      tag: 'XYZ Impact',
      text: 'Defined and tracked north-star KPIs (activation, retention, task completion) for [project], guiding changes that lifted retention by [X%].',
    },
    {
      tag: 'Analytics',
      text: 'Built a weekly scorecard reporting [N] core KPIs to help [team/managers] spot performance anomalies [X%] faster.',
    },
    {
      tag: 'Decision-Making',
      text: 'Benchmarked feature launches against pre-launch KPIs to prioritize high-ROI iterations for [N+ users].',
    },
  ],
  'Stakeholder Management': [
    {
      tag: 'Alignment',
      text: 'Led Stakeholder Management syncs with [N] engineering, design, and operations partners to align trade-offs and hit launch deadlines.',
    },
    {
      tag: 'Executive Updates',
      text: 'Strengthened Stakeholder Management by delivering concise weekly status briefs covering milestones, risks, and metric wins.',
    },
    {
      tag: 'Negotiation',
      text: 'Balanced competing requests through proactive Stakeholder Management, securing buy-in for [top-priority initiative] affecting [N+ users].',
    },
  ],
  Tableau: [
    {
      tag: 'XYZ Impact',
      text: 'Built an interactive Tableau dashboard tracking [sales/retention/operations KPIs], cutting weekly manual reporting time by [X%].',
    },
    {
      tag: 'Insights',
      text: 'Visualized [N+ rows] of customer behavior in Tableau, surfacing [key trend] that informed a [X%] efficiency improvement.',
    },
    {
      tag: 'Self-Serve BI',
      text: 'Published filterable Tableau workbooks with drill-down views used by [N] stakeholders for weekly planning.',
    },
  ],
  'Power BI': [
    {
      tag: 'XYZ Impact',
      text: 'Developed interactive Power BI dashboards with DAX measures tracking [regional/product KPIs], saving [X hours/week] in manual reporting.',
    },
    {
      tag: 'Data Modeling',
      text: 'Connected multi-table SQL datasets into Power BI to provide real-time visibility across [N] business metrics.',
    },
    {
      tag: 'Executive Reporting',
      text: 'Presented automated Power BI performance summaries to [managers/stakeholders], highlighting [X%] variance drivers.',
    },
  ],
  Dashboarding: [
    {
      tag: 'XYZ Impact',
      text: 'Engineered self-serve Dashboarding views monitoring [N] operational metrics, reducing ad-hoc data requests by [X%].',
    },
    {
      tag: 'Design Clarity',
      text: 'Standardized KPI definitions and visual hierarchy in executive Dashboarding, enabling [stakeholders] to spot trends in under [X minutes].',
    },
    {
      tag: 'Automation',
      text: 'Automated weekly data refreshes for team Dashboarding, eliminating [X hours] of repetitive spreadsheet copying.',
    },
  ],
  ETL: [
    {
      tag: 'XYZ Impact',
      text: 'Built automated Python and SQL ETL scripts cleaning [N+ rows] of raw data, cutting preparation time by [X%].',
    },
    {
      tag: 'Data Quality',
      text: 'Added schema validation and deduplication checks to ETL workflows, reducing downstream reporting errors by [X%].',
    },
    {
      tag: 'Pipelines',
      text: 'Consolidated [N] disparate CSV/API sources via a reproducible ETL pipeline for downstream analytics.',
    },
  ],
  Snowflake: [
    {
      tag: 'XYZ Impact',
      text: 'Queried and transformed [N+ row] analytical tables in Snowflake using optimized SQL, improving report runtime by [X%].',
    },
    {
      tag: 'Data Modeling',
      text: 'Created clean analytical views in Snowflake to power downstream BI dashboards for [N] business metrics.',
    },
    {
      tag: 'Reliability',
      text: 'Documented table schemas and data-freshness checks in Snowflake to support consistent team reporting.',
    },
  ],
  'Pivot Tables': [
    {
      tag: 'XYZ Impact',
      text: 'Built dynamic Excel models using Pivot Tables and lookup formulas across [N+ rows], cutting weekly analysis time by [X%].',
    },
    {
      tag: 'Operational Insight',
      text: 'Segmented [inventory/sales/traffic] trends with Pivot Tables to uncover a [X%] cost or efficiency opportunity.',
    },
    {
      tag: 'Reporting',
      text: 'Standardized reusable Pivot Tables templates so [team members] could refresh monthly summaries in [X minutes].',
    },
  ],

  // =========================================================================
  // STRATEGY & MANAGEMENT CONSULTING
  // =========================================================================
  'Management Consulting': [
    {
      tag: 'Case Impact',
      text: 'Structured a Management Consulting workstream across [N] client interviews and market datasets, identifying [CHF/EUR XM] in growth opportunities.',
    },
    {
      tag: 'Client Delivery',
      text: 'Delivered a Management Consulting recommendation deck for [C-level stakeholders], accelerating implementation of [key initiative] by [X weeks].',
    },
    {
      tag: 'Analytical Rigor',
      text: 'Synthesized operational benchmarks and financial sensitivities during a Management Consulting engagement spanning [N] European markets.',
    },
  ],
  'Strategy Consulting': [
    {
      tag: 'Strategic Impact',
      text: 'Led Strategy Consulting research on [target segment/region], sizing a [CHF/EUR XM] addressable market and defining a 3-pillar entry roadmap.',
    },
    {
      tag: 'Executive Alignment',
      text: 'Translated complex competitive dynamics into Strategy Consulting board slides endorsed by [N] senior executives.',
    },
    {
      tag: 'Value Creation',
      text: 'Evaluated [N] strategic options through Strategy Consulting issue trees, prioritizing initiatives projected to lift EBITDA by [X%].',
    },
  ],
  'Commercial Due Diligence': [
    {
      tag: 'CDD Workstream',
      text: 'Supported Commercial Due Diligence for a [CHF/EUR XM] B2B target, interviewing [N+] industry experts and validating [X%] CAGR assumptions.',
    },
    {
      tag: 'Market Assessment',
      text: 'Built a Commercial Due Diligence competitive landscape comparing [N] peers on pricing, churn, and customer NPS.',
    },
    {
      tag: 'IC Deliverable',
      text: 'Synthesized Commercial Due Diligence findings into a 25-slide executive summary highlighting [N] key upside levers and risks.',
    },
  ],
  'Market Sizing': [
    {
      tag: 'Bottom-Up Model',
      text: 'Constructed a bottom-up Market Sizing model across [N] DACH customer segments, quantifying a [CHF/EUR XM] SAM for [product/service].',
    },
    {
      tag: 'Decision Support',
      text: 'Triangulated top-down industry reports and bottom-up Market Sizing assumptions to prioritize [top 2] target verticals.',
    },
    {
      tag: 'Sensitivity Analysis',
      text: 'Stress-tested Market Sizing growth scenarios across conservative, base, and upside cases for [leadership/founders].',
    },
  ],
  MECE: [
    {
      tag: 'Structured Problem Solving',
      text: 'Decomposed an ambiguous [growth/margin] problem into a MECE issue tree across [N] root-cause drivers, cutting analysis turnaround by [X%].',
    },
    {
      tag: 'Executive Clarity',
      text: 'Structured C-level steering-committee updates using MECE logic to drive alignment across [N] cross-functional workstreams.',
    },
    {
      tag: 'Workshop Facilitation',
      text: 'Applied MECE frameworks to synthesize [N+] stakeholder inputs into [3] prioritized strategic recommendations.',
    },
  ],
  'Slide Storylining': [
    {
      tag: 'Board Deck',
      text: 'Authored a [N]-slide executive deck using Pyramid Principle Slide Storylining, securing leadership approval for a [CHF/EUR XM] initiative.',
    },
    {
      tag: 'Client Communication',
      text: 'Refined complex financial and market findings into action-titled Slide Storylining packs presented to [C-level/partner audience].',
    },
    {
      tag: 'Efficiency',
      text: 'Built reusable Slide Storylining templates and data charts in PowerPoint/Think-Cell, saving [X hours/week] for the project team.',
    },
  ],
  'Think-Cell': [
    {
      tag: 'Consulting Charts',
      text: 'Created executive waterfall, Marimekko, and CAGR bridge charts in Think-Cell and PowerPoint for [N] C-level steering reviews.',
    },
    {
      tag: 'Dynamic Reporting',
      text: 'Linked live Excel models directly to Think-Cell slides, eliminating manual chart updates across [N+] recurring board decks.',
    },
    {
      tag: 'Visual Precision',
      text: 'Standardized visual formatting across [N] client deliverables using Think-Cell, cutting final deck polish time by [X%].',
    },
  ],
  'Market Entry': [
    {
      tag: 'Expansion Strategy',
      text: 'Evaluated [N] European countries for Market Entry across regulatory, pricing, and channel criteria, selecting [top market] worth [CHF/EUR XM].',
    },
    {
      tag: 'GTM Roadmap',
      text: 'Designed a 12-month Market Entry playbook covering ICP targeting, local partnerships, and unit economics break-even targets.',
    },
    {
      tag: 'Competitive Edge',
      text: 'Benchmarked [N] local incumbents to define a differentiated Market Entry positioning strategy adopted by [management/founders].',
    },
  ],

  // =========================================================================
  // M&A / INVESTMENT BANKING & VENTURE CAPITAL / PRIVATE EQUITY
  // =========================================================================
  'M&A': [
    {
      tag: 'Transaction Support',
      text: 'Supported a [CHF/EUR XM] sell-side M&A mandate across target screening, valuation modeling, and VDR due diligence coordination.',
    },
    {
      tag: 'Target Screening',
      text: 'Screened [N+] European acquisition targets for a buy-side M&A pipeline, shortlisting [M] high-synergy candidates for MD review.',
    },
    {
      tag: 'Pitch Execution',
      text: 'Prepared M&A sector briefings, buyer long-lists, and strategic rationale slides for [N] C-suite client pitches.',
    },
  ],
  'DCF Modeling': [
    {
      tag: 'Valuation Model',
      text: 'Built a dynamic 5-year DCF Modeling workbook with WACC, terminal value, and sensitivity tables valuing a [CHF/EUR XM] [sector] company.',
    },
    {
      tag: 'Scenario Analysis',
      text: 'Modeled bull, base, and downside revenue/EBITDA drivers in DCF Modeling to triangulate an implied EV range of [CHF/EUR X–YM].',
    },
    {
      tag: 'Sanity Checks',
      text: 'Cross-checked DCF Modeling outputs against trading and precedent multiples to support [investment committee / client advisory] recommendations.',
    },
  ],
  'LBO Modeling': [
    {
      tag: 'Returns Analysis',
      text: 'Constructed an integrated LBO Modeling template with debt tranches, cash sweep, and IRR/MoIC sensitivity grids targeting [X%] IRR.',
    },
    {
      tag: 'Deal Evaluation',
      text: 'Stress-tested leverage capacity and deleveraging paths in LBO Modeling across [N] exit-multiple and margin-expansion scenarios.',
    },
    {
      tag: 'PE Readiness',
      text: 'Evaluated a [CHF/EUR XM] buyout case study using LBO Modeling and presented the investment thesis to [senior associates/partners].',
    },
  ],
  'Trading Comps': [
    {
      tag: 'Public Multiples',
      text: 'Compiled Trading Comps (EV/EBITDA, EV/Revenue, P/E) across [N] listed European peers using Capital IQ and Bloomberg.',
    },
    {
      tag: 'Valuation Football Field',
      text: 'Synthesized Trading Comps and Transaction Comps into a valuation football field anchoring a [CHF/EUR XM] pitchbook.',
    },
    {
      tag: 'Normalization',
      text: 'Cleaned non-recurring items and calendarized LTM/NTM consensus estimates for Trading Comps across [N] comparable companies.',
    },
  ],
  'Transaction Comps': [
    {
      tag: 'Precedent Analysis',
      text: 'Analyzed [N] European M&A deals to build Transaction Comps tables benchmarking control premiums and EV/EBITDA exit multiples.',
    },
    {
      tag: 'Deal Context',
      text: 'Mapped historical Transaction Comps in [sector] to substantiate a [X.Xx] valuation range in client pitch materials.',
    },
    {
      tag: 'Database Research',
      text: 'Extracted deal multiples and earn-out structures from Capital IQ/FactSet to update the team Transaction Comps database.',
    },
  ],
  Valuation: [
    {
      tag: 'Multi-Method',
      text: 'Performed multi-method Valuation (DCF, Trading Comps, Precedent Transactions) for [N] mid-cap [sector] targets valued at [CHF/EUR XM].',
    },
    {
      tag: 'Advisory Impact',
      text: 'Translated complex Valuation sensitivities into clear football-field visuals used in [N] senior management negotiations.',
    },
    {
      tag: 'Financial Rigor',
      text: 'Reconciled enterprise-to-equity value bridges (net debt, leases, minority interest) to sharpen Valuation accuracy across [N] models.',
    },
  ],
  Pitchbooks: [
    {
      tag: 'Client Advisory',
      text: 'Co-authored [N] M&A Pitchbooks covering market trends, buyer profiles, and valuation football fields for [sector] CFOs and boards.',
    },
    {
      tag: 'Fast Turnaround',
      text: 'Delivered zero-defect Pitchbooks and executive teasers under tight 48-hour client deadlines using PowerPoint and Think-Cell.',
    },
    {
      tag: 'Storyline',
      text: 'Structured financial charts and strategic positioning narratives across Pitchbooks contributing to [N] new advisory mandates.',
    },
  ],
  'Information Memorandum': [
    {
      tag: 'Sell-Side Prep',
      text: 'Drafted market overview, growth story, and historical financial sections of an Information Memorandum for a [CHF/EUR XM] transaction.',
    },
    {
      tag: 'Data Accuracy',
      text: 'Reconciled KPI tables and management financials inside the Information Memorandum against audited IFRS accounts.',
    },
    {
      tag: 'Investor Q&A',
      text: 'Supported follow-up buyer inquiries on the Information Memorandum via structured VDR Q&A tracking.',
    },
  ],
  'Capital IQ': [
    {
      tag: 'Screening',
      text: 'Screened [N+] European targets and pulled LTM/NTM financial spreads in Capital IQ to accelerate M&A buyer and peer lists by [X%].',
    },
    {
      tag: 'Excel Add-In',
      text: 'Automated live Trading Comps refresh templates via the Capital IQ Excel plug-in, saving [X hours/week] across deal teams.',
    },
    {
      tag: 'Precedents',
      text: 'Extracted transaction multiples and ownership structures from Capital IQ for [N] sector pitchbooks.',
    },
  ],
  'Deal Sourcing': [
    {
      tag: 'Origination',
      text: 'Led outbound Deal Sourcing across [N+] DACH B2B SaaS and AI startups, booking [M] qualified founder calls for the investment team.',
    },
    {
      tag: 'Pipeline Tracking',
      text: 'Built a structured Deal Sourcing pipeline in CRM tracking [N+] early-stage companies by ARR band, traction, and thesis fit.',
    },
    {
      tag: 'Ecosystem Reach',
      text: 'Leveraged university and startup-conference networks to generate [N] proprietary Deal Sourcing leads within [X months].',
    },
  ],
  'Investment Memo': [
    {
      tag: 'IC Deliverable',
      text: 'Authored [N] Investment Memo deep dives covering market sizing, unit economics, competitive moat, and return scenarios for partner review.',
    },
    {
      tag: 'Diligence Synthesis',
      text: 'Synthesized [N] customer reference calls and financial cohorts into a concise Investment Memo supporting a [CHF/EUR XM] ticket evaluation.',
    },
    {
      tag: 'Thesis Framing',
      text: 'Articulated bull/bear risks and valuation sensitivities in an Investment Memo that advanced [company] to final Investment Committee.',
    },
  ],
  'Unit Economics': [
    {
      tag: 'SaaS Analysis',
      text: 'Analyzed cohort-level Unit Economics (ARR, LTV/CAC, payback period, net dollar retention) across [N+] B2B customers in Excel/SQL.',
    },
    {
      tag: 'Margin Drivers',
      text: 'Identified customer segments with [X.Xx] stronger Unit Economics, guiding GTM reallocation that improved payback by [Y months].',
    },
    {
      tag: 'Diligence',
      text: 'Built a Unit Economics bridge reconciling gross margin, churn, and expansion ARR for [investor/management] review.',
    },
  ],
  'Market Mapping': [
    {
      tag: 'Sector Deep Dive',
      text: 'Created a comprehensive Market Mapping of [N+] European [AI/Fintech/Climate] startups segmented by value chain, funding, and traction.',
    },
    {
      tag: 'Sourcing Input',
      text: 'Translated Market Mapping whitespace findings into a prioritized outreach list of [M] high-conviction targets.',
    },
    {
      tag: 'Executive Brief',
      text: 'Presented quarterly Market Mapping benchmarks to [partners/founders], highlighting emerging M&A and partnership candidates.',
    },
  ],

  // =========================================================================
  // FOUNDER'S ASSOCIATE / GTM & AI INNOVATION
  // =========================================================================
  'Go-To-Market': [
    {
      tag: 'GTM Execution',
      text: 'Spearheaded a DACH Go-To-Market launch across [N+] target accounts, sharpening ICP messaging and lifting demo conversion by [X%].',
    },
    {
      tag: 'Funnel Impact',
      text: 'Built and tracked end-to-end Go-To-Market KPIs in CRM across outbound, events, and partner channels, generating [CHF/EUR XK] in pipeline.',
    },
    {
      tag: 'Founder Support',
      text: 'Translated C-level customer interviews into refined Go-To-Market positioning, pricing tiers, and sales enablement decks.',
    },
  ],
  'AI Workflow Design': [
    {
      tag: 'Automation ROI',
      text: 'Designed and deployed an AI Workflow Design pipeline automating [lead research/reporting/document triage], saving [X hours/week].',
    },
    {
      tag: 'Business Impact',
      text: 'Mapped [N] manual business processes and delivered an AI Workflow Design prototype cutting turnaround time by [X%].',
    },
    {
      tag: 'Adoption',
      text: 'Partnered with non-technical stakeholders to roll out reliable AI Workflow Design guardrails and prompt templates across [N] team members.',
    },
  ],
  'LLM Prototyping': [
    {
      tag: 'Rapid Prototype',
      text: 'Built [N] working LLM Prototyping workflows for [customer discovery/knowledge retrieval], validating business value with [M] pilot users.',
    },
    {
      tag: 'Evaluation',
      text: 'Iterated on prompts, structured outputs, and accuracy benchmarks in LLM Prototyping, lifting output reliability from [X%] to [Y%].',
    },
    {
      tag: 'Commercialization',
      text: 'Turned founder concepts into interactive LLM Prototyping demos used in [N] enterprise client pitches.',
    },
  ],
  'Pricing Strategy': [
    {
      tag: 'Monetization',
      text: 'Modeled [3] B2B Pricing Strategy tiers using willingness-to-pay interviews and competitor benchmarks, lifting projected ACV by [X%].',
    },
    {
      tag: 'Business Case',
      text: 'Analyzed gross margin and expansion levers to refine Pricing Strategy packaging for [N+] SME and enterprise accounts.',
    },
    {
      tag: 'Experimentation',
      text: 'Tested value-based Pricing Strategy proposals across [N] live prospect negotiations, improving win rate by [X%].',
    },
  ],
};

function getCategoryFallbackTemplates(
  keyword: string,
  category: SkillCategory | 'domain'
): Array<{ tag: string; text: string }> {
  switch (category) {
    case 'consulting':
      return [
        {
          tag: 'Consulting Impact',
          text: `Structured a ${keyword} workstream across [N] interviews and market datasets, identifying [CHF/EUR XM] in actionable value-creation potential.`,
        },
        {
          tag: 'Executive Delivery',
          text: `Synthesized quantitative analysis into board-ready ${keyword} slides presented to [C-level/senior stakeholders], driving alignment on [3] priorities.`,
        },
        {
          tag: 'Problem Solving',
          text: `Applied ${keyword} best practices across [N] cross-functional workstreams, shortening client decision cycles by [X%].`,
        },
      ];
    case 'finance':
      return [
        {
          tag: 'Deal / Model Impact',
          text: `Built dynamic ${keyword} analyses in Excel evaluating a [CHF/EUR XM] [sector] transaction across conservative, base, and upside cases.`,
        },
        {
          tag: 'IC / Pitch Deliverable',
          text: `Synthesized ${keyword} findings into client-ready pitchbooks and memos reviewed by [Directors/Partners] under tight deal timelines.`,
        },
        {
          tag: 'Analytical Rigor',
          text: `Reconciled financial statements and peer benchmarks for ${keyword} across [N+] European companies to sharpen valuation precision.`,
        },
      ];
    case 'swe':
      return [
        {
          tag: 'XYZ Impact',
          text: `Engineered [core feature/service] using ${keyword}, improving [performance/reliability metric] by [X%] for [N+ users].`,
        },
        {
          tag: 'Project Delivery',
          text: `Built and deployed [project module] with ${keyword}, reducing manual workflow steps by [X%] during [internship/course project].`,
        },
        {
          tag: 'Collaboration',
          text: `Collaborated with [N] teammates to apply ${keyword} best practices across [codebase/repository], cutting defect rates by [X%].`,
        },
      ];
    case 'pm':
      return [
        {
          tag: 'XYZ Impact',
          text: `Applied ${keyword} across [product feature/initiative], driving a [X%] improvement in [user activation/engagement] among [N+ users].`,
        },
        {
          tag: 'Discovery & Alignment',
          text: `Partnered with [N] engineering and design peers on ${keyword} to scope and ship [feature] on schedule.`,
        },
        {
          tag: 'STAR Outcome',
          text: `Synthesized user insights and metrics through ${keyword} to prioritize [N] high-impact improvements for [product/workflow].`,
        },
      ];
    case 'data':
      return [
        {
          tag: 'XYZ Impact',
          text: `Leveraged ${keyword} on [N+ row dataset] to uncover [actionable trend], contributing to a [X%] gain in [efficiency/revenue].`,
        },
        {
          tag: 'Automation',
          text: `Streamlined weekly ${keyword} workflows for [team/managers], saving [X hours/week] and improving metric accuracy.`,
        },
        {
          tag: 'Stakeholder Impact',
          text: `Translated ${keyword} findings into clear visual recommendations presented to [N] decision-makers.`,
        },
      ];
    case 'design':
      return [
        {
          tag: 'XYZ Impact',
          text: `Created user-tested ${keyword} deliverables for [app/onboarding flow], boosting task completion by [X%] across [N] participants.`,
        },
        {
          tag: 'Iteration',
          text: `Iterated on ${keyword} artifacts using feedback from [N] student interviews to resolve [key usability friction].`,
        },
        {
          tag: 'Handoff',
          text: `Collaborated with [N] engineers to turn ${keyword} specs into responsive, accessible production interfaces.`,
        },
      ];
    case 'business':
    case 'domain':
    default:
      return [
        {
          tag: 'XYZ Impact',
          text: `Applied ${keyword} to streamline [team/campus operation], delivering a [X%] improvement in [turnaround/cost/output].`,
        },
        {
          tag: 'Analysis & Action',
          text: `Evaluated [N] operational metrics using ${keyword} to recommend [specific improvement] adopted by [stakeholders].`,
        },
        {
          tag: 'Cross-Functional',
          text: `Coordinated across [N] team members on ${keyword} deliverables, meeting [100%] of milestone deadlines.`,
        },
      ];
  }
}

export function getBulletTemplatesForKeyword(
  keyword: string,
  category: SkillCategory | 'domain'
): BulletTemplate[] {
  const rawList =
    SPECIFIC_TEMPLATES[keyword] || getCategoryFallbackTemplates(keyword, category);

  return rawList.map((item, idx) => ({
    id: `${keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idx}`,
    tag: item.tag,
    text: item.text,
  }));
}
