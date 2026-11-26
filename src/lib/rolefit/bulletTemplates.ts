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
};

function getCategoryFallbackTemplates(
  keyword: string,
  category: SkillCategory | 'domain'
): Array<{ tag: string; text: string }> {
  switch (category) {
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
