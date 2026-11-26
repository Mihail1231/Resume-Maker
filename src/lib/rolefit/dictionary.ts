export type SkillCategory =
  | 'swe'
  | 'pm'
  | 'data'
  | 'business'
  | 'consulting'
  | 'finance'
  | 'design';

export interface SkillEntry {
  canonical: string;
  category: SkillCategory;
  /** Case-insensitive aliases / synonyms (canonical itself is always included). */
  aliases: string[];
  /** Case-sensitive aliases for short ambiguous acronyms like R, Go, C, PM, BI, VC, PE, IM, LBO. */
  caseSensitiveAliases?: string[];
}

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  consulting: 'Consulting & Strategy',
  finance: 'M&A / IB & VC / PE',
  business: 'Business, GTM & Ops',
  pm: 'Product',
  data: 'Data & Analytics',
  swe: 'Engineering & AI',
  design: 'Design & Tools',
};

/**
 * Curated dictionary of ~275 early-career skills spanning Strategy Consulting,
 * M&A / Investment Banking, VC / PE, Founder's Associate / GTM, Product Management,
 * Data & Analytics, Software Engineering / AI, and Design.
 */
export const SKILL_DICTIONARY: SkillEntry[] = [
  // =========================================================================
  // STRATEGY & MANAGEMENT CONSULTING
  // =========================================================================
  { canonical: 'Management Consulting', category: 'consulting', aliases: ['management consulting', 'consulting work', 'consulting projects'] },
  { canonical: 'Strategy Consulting', category: 'consulting', aliases: ['strategy consulting', 'strategic consulting', 'corporate strategy', 'strategic management'] },
  { canonical: 'Commercial Due Diligence', category: 'consulting', aliases: ['commercial due diligence', 'market due diligence'], caseSensitiveAliases: ['CDD'] },
  { canonical: 'Market Sizing', category: 'consulting', aliases: ['market sizing', 'tam sam som', 'addressable market', 'bottom-up sizing', 'top-down sizing'] },
  { canonical: 'MECE', category: 'consulting', aliases: ['mece framework', 'issue trees', 'issue tree'], caseSensitiveAliases: ['MECE'] },
  { canonical: 'Hypothesis-Driven Problem Solving', category: 'consulting', aliases: ['hypothesis-driven problem solving', 'hypothesis-driven', 'hypothesis driven', 'structured problem solving'] },
  { canonical: 'Slide Storylining', category: 'consulting', aliases: ['slide storylining', 'storylining', 'pyramid principle', 'executive slides', 'board decks'] },
  { canonical: 'Client Workshops', category: 'consulting', aliases: ['client workshops', 'workshop facilitation', 'client facilitation', 'executive workshops'] },
  { canonical: 'Operating Model', category: 'consulting', aliases: ['operating model', 'target operating model', 'organizational design', 'org design'] },
  { canonical: 'Business Case', category: 'consulting', aliases: ['business case', 'business cases', 'business case modeling', 'roi case'] },
  { canonical: 'Market Entry', category: 'consulting', aliases: ['market entry', 'market entry strategy', 'international expansion', 'geographic expansion'] },
  { canonical: 'Post-Merger Integration', category: 'consulting', aliases: ['post-merger integration', 'post merger integration', 'synergy realization', 'carve-out'], caseSensitiveAliases: ['PMI'] },
  { canonical: 'Change Management', category: 'consulting', aliases: ['change management', 'organizational transformation', 'stakeholder adoption'] },
  { canonical: 'PowerPoint', category: 'consulting', aliases: ['powerpoint', 'ms powerpoint', 'microsoft powerpoint', 'slide decks'], caseSensitiveAliases: ['PPT'] },
  { canonical: 'Think-Cell', category: 'consulting', aliases: ['think-cell', 'thinkcell'] },
  { canonical: 'C-Level Communication', category: 'consulting', aliases: ['c-level communication', 'c-level', 'c-suite communication', 'executive communication', 'senior leadership'] },
  { canonical: 'Digital Transformation', category: 'consulting', aliases: ['digital transformation', 'business transformation', 'ai transformation'] },
  { canonical: 'Value Creation', category: 'consulting', aliases: ['value creation', 'value creation plan', 'operational value creation'] },
  { canonical: 'Sustainability Strategy', category: 'consulting', aliases: ['sustainability strategy', 'esg', 'sustainability-oriented', 'net-zero strategy'] },

  // =========================================================================
  // M&A / INVESTMENT BANKING & VENTURE CAPITAL / PRIVATE EQUITY
  // =========================================================================
  { canonical: 'M&A', category: 'finance', aliases: ['m&a', 'mergers & acquisitions', 'mergers and acquisitions', 'buy-side', 'sell-side', 'm&a advisory'] },
  { canonical: 'Valuation', category: 'finance', aliases: ['valuation', 'company valuation', 'enterprise valuation', 'equity valuation', 'valuation models'] },
  { canonical: 'DCF Modeling', category: 'finance', aliases: ['dcf modeling', 'discounted cash flow', 'dcf analysis', 'dcf model', 'wacc'], caseSensitiveAliases: ['DCF'] },
  { canonical: 'LBO Modeling', category: 'finance', aliases: ['lbo modeling', 'leveraged buyout', 'lbo model', 'debt schedules', 'returns analysis'], caseSensitiveAliases: ['LBO'] },
  { canonical: 'Trading Comps', category: 'finance', aliases: ['trading comps', 'comparable company analysis', 'public comps', 'peer multiples'], caseSensitiveAliases: ['CCA'] },
  { canonical: 'Transaction Comps', category: 'finance', aliases: ['transaction comps', 'precedent transactions', 'm&a comps', 'precedent transaction analysis'] },
  { canonical: 'Financial Modeling', category: 'finance', aliases: ['financial modeling', 'financial models', 'financial analysis', '3-statement modeling', 'three-statement model', 'budgeting', 'p&l'] },
  { canonical: 'Pitchbooks', category: 'finance', aliases: ['pitchbooks', 'pitchbook', 'pitch materials', 'pitch decks', 'pitch deck', 'client pitches'] },
  { canonical: 'Information Memorandum', category: 'finance', aliases: ['information memorandum', 'confidential information memorandum', 'teaser', 'management presentation'], caseSensitiveAliases: ['IM', 'CIM'] },
  { canonical: 'Due Diligence', category: 'finance', aliases: ['due diligence', 'financial due diligence', 'virtual data room', 'vdr', 'q&a process'], caseSensitiveAliases: ['FDD'] },
  { canonical: 'Corporate Finance', category: 'finance', aliases: ['corporate finance', 'capital structure', 'capital markets', 'equity financing', 'debt financing'] },
  { canonical: 'Capital IQ', category: 'finance', aliases: ['capital iq', 'capiq', 's&p capital iq'] },
  { canonical: 'Bloomberg', category: 'finance', aliases: ['bloomberg', 'bloomberg terminal'] },
  { canonical: 'FactSet', category: 'finance', aliases: ['factset', 'pitchbook database', 'mergermarket', 'refinitiv'] },
  { canonical: 'Financial Accounting / IFRS', category: 'finance', aliases: ['financial accounting', 'ifrs', 'us gaap', 'financial statements', 'balance sheet', 'cash flow statement'] },
  { canonical: 'Excel Modeling', category: 'finance', aliases: ['excel modeling', 'advanced excel', 'financial excel', 'sensitivity analysis', 'scenario modeling'] },
  { canonical: 'Venture Capital', category: 'finance', aliases: ['venture capital', 'early-stage investing', 'growth equity', 'seed investing'], caseSensitiveAliases: ['VC'] },
  { canonical: 'Private Equity', category: 'finance', aliases: ['private equity', 'buyout', 'pe funds', 'pe investing'], caseSensitiveAliases: ['PE'] },
  { canonical: 'Deal Sourcing', category: 'finance', aliases: ['deal sourcing', 'origination', 'deal flow', 'dealflow', 'pipeline sourcing', 'outbound sourcing'] },
  { canonical: 'Investment Memo', category: 'finance', aliases: ['investment memo', 'investment memos', 'ic memo', 'investment committee memo', 'investment thesis'] },
  { canonical: 'Market Mapping', category: 'finance', aliases: ['market mapping', 'landscape mapping', 'sector mapping', 'industry mapping', 'deep dives'] },
  { canonical: 'Unit Economics', category: 'finance', aliases: ['unit economics', 'ltv/cac', 'ltv to cac', 'cohort retention', 'gross margin', 'net dollar retention', 'burn multiple'], caseSensitiveAliases: ['ARR', 'MRR', 'CAC', 'LTV'] },
  { canonical: 'Cap Table & Term Sheets', category: 'finance', aliases: ['cap table', 'cap tables', 'term sheet', 'term sheets', 'dilution modeling', 'waterfall analysis'] },
  { canonical: 'Portfolio Value Creation', category: 'finance', aliases: ['portfolio value creation', 'portfolio support', 'portfolio design', 'portfolio management', 'portfolio companies'] },
  { canonical: 'Startup Scouting', category: 'finance', aliases: ['startup scouting', 'founder outreach', 'founder sourcing', 'startup evaluation', 'screening startups'] },
  { canonical: 'Competitive Benchmarking', category: 'finance', aliases: ['competitive benchmarking', 'peer benchmarking', 'competitor benchmarking', 'benchmarking'] },
  { canonical: 'Deal Execution', category: 'finance', aliases: ['deal execution', 'transaction execution', 'transaction advisory', 'closing process'] },

  // =========================================================================
  // BUSINESS, FOUNDER'S ASSOCIATE, GTM & OPERATIONS
  // =========================================================================
  { canonical: 'Go-To-Market', category: 'business', aliases: ['go-to-market', 'go to market', 'gtm strategy', 'gtm priorities', 'product launch', 'launch strategy'], caseSensitiveAliases: ['GTM'] },
  { canonical: 'Ideal Customer Profile', category: 'business', aliases: ['ideal customer profile', 'icp refinement', 'icp definition', 'target segmentation'], caseSensitiveAliases: ['ICP'] },
  { canonical: 'B2B Outreach', category: 'business', aliases: ['b2b outreach', 'b2b prospect qualification', 'structured outreach', 'outbound sales', 'cold outreach', 'lead qualification'] },
  { canonical: 'Sales Funnel Management', category: 'business', aliases: ['sales funnel', 'funnel management', 'pipeline management', 'opportunity tracking', 'sales pipeline', 'crm-based funnel management'] },
  { canonical: 'Business Development', category: 'business', aliases: ['business development', 'bizdev', 'commercial growth', 'strategic growth'] },
  { canonical: 'Business Model Innovation', category: 'business', aliases: ['business model innovation', 'digital business models', 'business models', 'monetization strategy'] },
  { canonical: 'Market Validation', category: 'business', aliases: ['market validation', 'customer validation', 'demand signals', 'offer logic', 'product-market fit'] },
  { canonical: 'Partnership Development', category: 'business', aliases: ['partnership development', 'partnership mapping', 'strategic partnerships', 'partnerships', 'sponsorships', 'channel partnerships'] },
  { canonical: 'Positioning & Messaging', category: 'business', aliases: ['positioning', 'product positioning', 'value proposition', 'commercial communication', 'use cases'] },
  { canonical: 'CRM', category: 'business', aliases: ['salesforce', 'hubspot', 'pipedrive', 'customer relationship management', 'crm-based'], caseSensitiveAliases: ['CRM'] },
  { canonical: 'Business Analysis', category: 'business', aliases: ['business analysis', 'business analyst', 'gap analysis'] },
  { canonical: 'Process Optimization', category: 'business', aliases: ['process optimization', 'process improvement', 'operational efficiency', 'workflow automation', 'six sigma'] },
  { canonical: 'Project Management', category: 'business', aliases: ['project management', 'project coordination', 'timeline management', 'project delivery'] },
  { canonical: 'Strategic Planning', category: 'business', aliases: ['strategic planning', 'business strategy', 'strategic initiatives', 'strategic decision-making'] },
  { canonical: 'Operations Management', category: 'business', aliases: ['operations management', 'business operations', 'bizops', 'supply chain', 'inventory management'] },
  { canonical: 'Marketing Analytics', category: 'business', aliases: ['marketing analytics', 'digital marketing', 'campaign performance', 'campaign roi', 'instagram marketing'] },
  { canonical: 'SEO / SEM', category: 'business', aliases: ['seo', 'sem', 'search engine optimization', 'google ads'] },
  { canonical: 'Presentation Skills', category: 'business', aliases: ['presentation skills', 'presentation decks', 'google slides', 'executive presentations'] },
  { canonical: 'Communication', category: 'business', aliases: ['communication', 'written communication', 'verbal communication', 'communication skills'] },
  { canonical: 'Problem Solving', category: 'business', aliases: ['problem solving', 'problem-solving', 'critical thinking', 'analytical thinking'] },
  { canonical: 'Leadership', category: 'business', aliases: ['leadership', 'team leadership', 'mentoring', 'founder and president'] },
  { canonical: 'Client Management', category: 'business', aliases: ['client management', 'account management', 'customer success', 'client relationships'] },
  { canonical: 'Risk & Crisis Management', category: 'business', aliases: ['risk analysis', 'risk management', 'crisis management', 'compliance', 'auditing'] },
  { canonical: 'Vendor Management', category: 'business', aliases: ['vendor management', 'procurement', 'supplier management'] },
  { canonical: 'E-Commerce', category: 'business', aliases: ['e-commerce', 'ecommerce', 'conversion funnel', 'conversion funnels', 'secondary market'] },
  { canonical: 'Revenue Operations', category: 'business', aliases: ['revenue operations', 'revops', 'sales operations', 'pipeline analysis'] },
  { canonical: 'Cost Reduction', category: 'business', aliases: ['cost reduction', 'margin optimization', 'cost analysis', 'cost transformation'] },
  { canonical: 'Data-Driven Decision Making', category: 'business', aliases: ['data-driven decision making', 'data-driven', 'data driven'] },
  { canonical: 'Design Thinking', category: 'business', aliases: ['design thinking', 'human-centered design', 'service design'] },
  { canonical: 'Digital Innovation', category: 'business', aliases: ['digital innovation', 'business innovation', 'innovation management'] },

  // =========================================================================
  // AI INNOVATION & SOFTWARE ENGINEERING (SWE)
  // =========================================================================
  { canonical: 'AI Workflow Design', category: 'swe', aliases: ['ai workflow design', 'ai workflows', 'ai automation', 'ai process automation', 'ai solution design'] },
  { canonical: 'LLM Prototyping', category: 'swe', aliases: ['llm prototyping', 'llm-enabled', 'prompt-based prototyping', 'prompt engineering', 'ai prototyping'] },
  { canonical: 'Generative AI / LLMs', category: 'swe', aliases: ['generative ai', 'genai', 'llms', 'llm', 'openai api', 'langchain', 'rag'] },
  { canonical: 'Agentic AI', category: 'swe', aliases: ['agentic ai', 'agentic ai governance', 'ai agents', 'multi-agent', 'ai governance'] },
  { canonical: 'AI Readiness Assessment', category: 'swe', aliases: ['ai readiness assessment', 'ai readiness', 'ai strategy', 'ai adoption'] },
  { canonical: 'No-Code / Low-Code', category: 'swe', aliases: ['no-code/low-code', 'no-code', 'low-code', 'zapier', 'make.com', 'n8n', 'airtable'] },
  { canonical: 'JavaScript', category: 'swe', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { canonical: 'TypeScript', category: 'swe', aliases: ['typescript', 'ts'] },
  { canonical: 'Python', category: 'swe', aliases: ['python', 'python3'] },
  { canonical: 'Java', category: 'swe', aliases: ['java'] },
  { canonical: 'C++', category: 'swe', aliases: ['c++', 'cpp'] },
  { canonical: 'C#', category: 'swe', aliases: ['c#', 'csharp', 'c-sharp'] },
  { canonical: 'Go', category: 'swe', aliases: ['golang'], caseSensitiveAliases: ['Go'] },
  { canonical: 'Rust', category: 'swe', aliases: ['rust', 'rustlang'] },
  { canonical: 'Swift', category: 'swe', aliases: ['swift', 'swiftui'] },
  { canonical: 'Kotlin', category: 'swe', aliases: ['kotlin'] },
  { canonical: 'Ruby', category: 'swe', aliases: ['ruby'] },
  { canonical: 'PHP', category: 'swe', aliases: ['php'] },
  { canonical: 'HTML', category: 'swe', aliases: ['html', 'html5'] },
  { canonical: 'CSS', category: 'swe', aliases: ['css', 'css3', 'scss', 'sass'] },
  { canonical: 'Bash', category: 'swe', aliases: ['bash', 'shell scripting', 'bash scripting'] },
  { canonical: 'C', category: 'swe', aliases: ['c programming', 'c language'], caseSensitiveAliases: ['C'] },

  // Frontend
  { canonical: 'React', category: 'swe', aliases: ['react', 'react.js', 'reactjs'] },
  { canonical: 'Next.js', category: 'swe', aliases: ['next.js', 'nextjs', 'next js'] },
  { canonical: 'Vue.js', category: 'swe', aliases: ['vue.js', 'vuejs', 'vue'] },
  { canonical: 'Angular', category: 'swe', aliases: ['angular', 'angularjs'] },
  { canonical: 'Svelte', category: 'swe', aliases: ['svelte', 'sveltekit'] },
  { canonical: 'Tailwind CSS', category: 'swe', aliases: ['tailwind css', 'tailwindcss', 'tailwind'] },
  { canonical: 'Redux', category: 'swe', aliases: ['redux', 'redux toolkit', 'zustand'] },
  { canonical: 'Web Accessibility', category: 'swe', aliases: ['web accessibility', 'accessibility', 'a11y', 'wcag', 'accessible web'] },
  { canonical: 'Responsive Design', category: 'swe', aliases: ['responsive design', 'responsive web', 'responsive interfaces', 'mobile-first'] },
  { canonical: 'Vite', category: 'swe', aliases: ['vite'] },
  { canonical: 'Webpack', category: 'swe', aliases: ['webpack'] },

  // Backend & APIs
  { canonical: 'Node.js', category: 'swe', aliases: ['node.js', 'nodejs', 'node js'] },
  { canonical: 'Express.js', category: 'swe', aliases: ['express.js', 'expressjs', 'express'] },
  { canonical: 'Django', category: 'swe', aliases: ['django'] },
  { canonical: 'Flask', category: 'swe', aliases: ['flask'] },
  { canonical: 'FastAPI', category: 'swe', aliases: ['fastapi'] },
  { canonical: 'Spring Boot', category: 'swe', aliases: ['spring boot', 'springboot', 'spring framework'] },
  { canonical: 'Ruby on Rails', category: 'swe', aliases: ['ruby on rails', 'rails'] },
  { canonical: '.NET', category: 'swe', aliases: ['.net', 'asp.net', 'dotnet'] },
  { canonical: 'REST APIs', category: 'swe', aliases: ['rest apis', 'rest api', 'restful api', 'restful apis', 'restful'] },
  { canonical: 'GraphQL', category: 'swe', aliases: ['graphql'] },
  { canonical: 'Microservices', category: 'swe', aliases: ['microservices', 'microservice architecture'] },
  { canonical: 'WebSockets', category: 'swe', aliases: ['websockets', 'websocket', 'socket.io'] },
  { canonical: 'Authentication', category: 'swe', aliases: ['authentication', 'oauth', 'oauth2', 'jwt', 'sso', 'auth0'] },
  { canonical: 'System Design', category: 'swe', aliases: ['system design', 'distributed systems', 'scalable architecture', 'software architecture'] },
  { canonical: 'API Integration', category: 'swe', aliases: ['api integration', 'api integrations', 'third-party apis'] },

  // Databases
  { canonical: 'PostgreSQL', category: 'swe', aliases: ['postgresql', 'postgres', 'psql'] },
  { canonical: 'MySQL', category: 'swe', aliases: ['mysql'] },
  { canonical: 'MongoDB', category: 'swe', aliases: ['mongodb', 'mongo', 'nosql'] },
  { canonical: 'Redis', category: 'swe', aliases: ['redis'] },
  { canonical: 'Firebase', category: 'swe', aliases: ['firebase', 'firestore'] },
  { canonical: 'Supabase', category: 'swe', aliases: ['supabase'] },
  { canonical: 'Prisma', category: 'swe', aliases: ['prisma', 'prisma orm'] },
  { canonical: 'DynamoDB', category: 'swe', aliases: ['dynamodb'] },
  { canonical: 'SQLite', category: 'swe', aliases: ['sqlite'] },

  // Cloud, DevOps & Tooling
  { canonical: 'Git', category: 'swe', aliases: ['git', 'version control', 'github', 'gitlab'] },
  { canonical: 'Docker', category: 'swe', aliases: ['docker', 'containerization', 'containers'] },
  { canonical: 'Kubernetes', category: 'swe', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'AWS', category: 'swe', aliases: ['aws', 'amazon web services', 'ec2', 'lambda'] },
  { canonical: 'Google Cloud', category: 'swe', aliases: ['google cloud', 'gcp', 'google cloud platform'] },
  { canonical: 'Azure', category: 'swe', aliases: ['azure', 'microsoft azure'] },
  { canonical: 'CI/CD', category: 'swe', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'continuous delivery', 'github actions', 'jenkins'] },
  { canonical: 'Linux', category: 'swe', aliases: ['linux', 'unix', 'ubuntu'] },
  { canonical: 'Terraform', category: 'swe', aliases: ['terraform', 'infrastructure as code'] },
  { canonical: 'Vercel', category: 'swe', aliases: ['vercel', 'netlify'] },

  // Testing & CS Fundamentals
  { canonical: 'Unit Testing', category: 'swe', aliases: ['unit testing', 'unit tests', 'jest', 'vitest', 'pytest', 'junit', 'mocha', 'automated testing', 'tdd'] },
  { canonical: 'End-to-End Testing', category: 'swe', aliases: ['end-to-end testing', 'e2e testing', 'playwright', 'cypress', 'selenium'] },
  { canonical: 'Debugging', category: 'swe', aliases: ['debugging', 'debug', 'troubleshooting', 'root cause analysis'] },
  { canonical: 'Data Structures & Algorithms', category: 'swe', aliases: ['data structures & algorithms', 'data structures and algorithms', 'data structures', 'algorithms', 'dsa'] },
  { canonical: 'Object-Oriented Programming', category: 'swe', aliases: ['object-oriented programming', 'object oriented programming', 'oop'] },
  { canonical: 'Code Review', category: 'swe', aliases: ['code review', 'code reviews', 'pull requests'] },
  { canonical: 'Performance Optimization', category: 'swe', aliases: ['performance optimization', 'web performance', 'latency optimization', 'query optimization'] },
  { canonical: 'Mobile Development', category: 'swe', aliases: ['mobile development', 'react native', 'flutter', 'ios development', 'android development'] },
  { canonical: 'Machine Learning', category: 'swe', aliases: ['machine learning', 'deep learning', 'scikit-learn', 'pytorch', 'tensorflow'], caseSensitiveAliases: ['ML'] },
  { canonical: 'Cybersecurity', category: 'swe', aliases: ['cybersecurity', 'application security', 'owasp', 'infosec'] },

  // =========================================================================
  // PRODUCT MANAGEMENT (PM)
  // =========================================================================
  { canonical: 'Product Management', category: 'pm', aliases: ['product management', 'product manager', 'product managers', 'product ownership'], caseSensitiveAliases: ['PM'] },
  { canonical: 'Product Strategy', category: 'pm', aliases: ['product strategy', 'product vision'] },
  { canonical: 'Product Roadmap', category: 'pm', aliases: ['product roadmap', 'product roadmaps', 'roadmapping', 'roadmap planning'] },
  { canonical: 'PRD', category: 'pm', aliases: ['product requirements document', 'product requirements documents', 'product requirements', 'product specs', 'prds'], caseSensitiveAliases: ['PRD'] },
  { canonical: 'User Stories', category: 'pm', aliases: ['user stories', 'user story', 'acceptance criteria'] },
  { canonical: 'Agile', category: 'pm', aliases: ['agile', 'agile methodology', 'agile development', 'agile workflows'] },
  { canonical: 'Scrum', category: 'pm', aliases: ['scrum', 'scrum master', 'sprint planning', 'sprint ceremonies'] },
  { canonical: 'Kanban', category: 'pm', aliases: ['kanban'] },
  { canonical: 'Feature Prioritization', category: 'pm', aliases: ['feature prioritization', 'backlog prioritization', 'backlog grooming', 'backlog management', 'rice framework'] },
  { canonical: 'A/B Testing', category: 'pm', aliases: ['a/b testing', 'ab testing', 'split testing', 'a/b experiments', 'experimentation', 'multivariate testing'] },
  { canonical: 'Product Analytics', category: 'pm', aliases: ['product analytics', 'funnel analysis', 'retention analysis', 'cohort analysis', 'mixpanel', 'amplitude', 'posthog'] },
  { canonical: 'User Research', category: 'pm', aliases: ['user research', 'customer discovery', 'user interviews', 'customer interviews', 'qualitative research'] },
  { canonical: 'Customer Empathy', category: 'pm', aliases: ['customer empathy', 'voice of customer', 'customer feedback', 'user feedback', 'user-centric'] },
  { canonical: 'Competitive Analysis', category: 'pm', aliases: ['competitive analysis', 'competitor analysis', 'market research'] },
  { canonical: 'KPIs', category: 'pm', aliases: ['kpis', 'key performance indicators', 'north star metric', 'success metrics', 'product metrics'], caseSensitiveAliases: ['KPI'] },
  { canonical: 'OKRs', category: 'pm', aliases: ['okrs', 'objectives and key results'], caseSensitiveAliases: ['OKR'] },
  { canonical: 'Cross-Functional Collaboration', category: 'pm', aliases: ['cross-functional collaboration', 'cross-functional', 'cross functional', 'cross-functional teams'] },
  { canonical: 'Stakeholder Management', category: 'pm', aliases: ['stakeholder management', 'stakeholder alignment', 'stakeholder communication', 'stakeholder needs'] },
  { canonical: 'Jira', category: 'pm', aliases: ['jira', 'atlassian jira'] },
  { canonical: 'Confluence', category: 'pm', aliases: ['confluence'] },
  { canonical: 'Linear', category: 'pm', aliases: ['linear app', 'linear'] },
  { canonical: 'Notion', category: 'pm', aliases: ['notion'] },
  { canonical: 'Product Lifecycle', category: 'pm', aliases: ['product lifecycle', 'end-to-end product', 'sdlc'] },
  { canonical: 'Growth Strategy', category: 'pm', aliases: ['growth strategy', 'user acquisition', 'conversion optimization', 'activation and retention', 'growth initiatives'] },
  { canonical: 'Pricing Strategy', category: 'pm', aliases: ['pricing strategy', 'monetization', 'pricing models'] },
  { canonical: 'B2B SaaS', category: 'pm', aliases: ['b2b saas', 'saas', 'enterprise saas'] },
  { canonical: 'Customer Journey Mapping', category: 'pm', aliases: ['customer journey mapping', 'user journey', 'user flows', 'journey mapping'] },
  { canonical: 'Requirements Gathering', category: 'pm', aliases: ['requirements gathering', 'technical requirements', 'business requirements'] },

  // =========================================================================
  // DATA & ANALYTICS
  // =========================================================================
  { canonical: 'SQL', category: 'data', aliases: ['sql', 'structured query language', 'sql queries', 't-sql', 'pl/sql'] },
  { canonical: 'Data Analysis', category: 'data', aliases: ['data analysis', 'data analytics', 'quantitative analysis', 'exploratory data analysis'] },
  { canonical: 'Data Visualization', category: 'data', aliases: ['data visualization', 'data viz', 'visual storytelling'] },
  { canonical: 'Tableau', category: 'data', aliases: ['tableau'] },
  { canonical: 'Power BI', category: 'data', aliases: ['power bi', 'powerbi', 'dax'] },
  { canonical: 'Excel', category: 'data', aliases: ['excel', 'microsoft excel', 'spreadsheets', 'vlookup', 'xlookup', 'google sheets'] },
  { canonical: 'Pivot Tables', category: 'data', aliases: ['pivot tables', 'pivot table', 'excel macros', 'vba'] },
  { canonical: 'Statistical Analysis', category: 'data', aliases: ['statistical analysis', 'statistics', 'hypothesis testing', 'regression analysis', 'statistical modeling'] },
  { canonical: 'SPSS', category: 'data', aliases: ['spss', 'ibm spss', 'stata'] },
  { canonical: 'ETL', category: 'data', aliases: ['etl', 'extract transform load', 'data pipelines', 'data pipeline', 'data ingestion'] },
  { canonical: 'Data Modeling', category: 'data', aliases: ['data modeling', 'dimensional modeling', 'star schema', 'schema design'] },
  { canonical: 'Data Cleaning', category: 'data', aliases: ['data cleaning', 'data wrangling', 'data preprocessing', 'data hygiene', 'cleaned'] },
  { canonical: 'Dashboarding', category: 'data', aliases: ['dashboarding', 'dashboards', 'interactive dashboards', 'bi dashboards', 'executive dashboards'] },
  { canonical: 'Business Intelligence', category: 'data', aliases: ['business intelligence', 'bi tools', 'bi reporting'], caseSensitiveAliases: ['BI'] },
  { canonical: 'Pandas', category: 'data', aliases: ['pandas', 'numpy', 'scipy'] },
  { canonical: 'R', category: 'data', aliases: ['r programming', 'rstudio', 'tidyverse'], caseSensitiveAliases: ['R'] },
  { canonical: 'BigQuery', category: 'data', aliases: ['bigquery', 'google bigquery'] },
  { canonical: 'Snowflake', category: 'data', aliases: ['snowflake'] },
  { canonical: 'Looker', category: 'data', aliases: ['looker', 'looker studio', 'data studio'] },
  { canonical: 'dbt', category: 'data', aliases: ['dbt', 'data build tool'] },
  { canonical: 'Apache Spark', category: 'data', aliases: ['apache spark', 'pyspark', 'spark'] },
  { canonical: 'Airflow', category: 'data', aliases: ['airflow', 'apache airflow'] },
  { canonical: 'Forecasting', category: 'data', aliases: ['forecasting', 'time series', 'predictive modeling', 'demand forecasting'] },
  { canonical: 'Google Analytics', category: 'data', aliases: ['google analytics', 'ga4', 'web analytics'] },
  { canonical: 'Reporting', category: 'data', aliases: ['reporting', 'automated reporting', 'ad-hoc reporting', 'executive reporting'] },
  { canonical: 'Data Warehousing', category: 'data', aliases: ['data warehousing', 'data warehouse', 'redshift'] },
  { canonical: 'Jupyter', category: 'data', aliases: ['jupyter', 'jupyter notebook', 'jupyter notebooks', 'google colab'] },
  { canonical: 'Matplotlib / Seaborn', category: 'data', aliases: ['matplotlib', 'seaborn', 'plotly'] },
  { canonical: 'Natural Language Processing', category: 'data', aliases: ['natural language processing', 'nlp', 'text analytics'] },
  { canonical: 'Data Governance', category: 'data', aliases: ['data governance', 'data integrity', 'data validation', 'data quality'] },

  // =========================================================================
  // DESIGN & COLLABORATION TOOLS
  // =========================================================================
  { canonical: 'Figma', category: 'design', aliases: ['figma'] },
  { canonical: 'Wireframing', category: 'design', aliases: ['wireframing', 'wireframes', 'wireframe'] },
  { canonical: 'Prototyping', category: 'design', aliases: ['prototyping', 'rapid prototyping', 'interactive prototypes', 'clickable prototypes'] },
  { canonical: 'UI/UX Design', category: 'design', aliases: ['ui/ux', 'ui/ux design', 'ux design', 'ui design', 'user experience', 'product design', 'interaction design'] },
  { canonical: 'Design Systems', category: 'design', aliases: ['design systems', 'design system', 'component library', 'style guide'] },
  { canonical: 'Information Architecture', category: 'design', aliases: ['information architecture'] },
  { canonical: 'Adobe Creative Suite', category: 'design', aliases: ['adobe creative suite', 'photoshop', 'illustrator', 'adobe xd'] },
  { canonical: 'Sketch', category: 'design', aliases: ['sketch app'] },
  { canonical: 'Miro', category: 'design', aliases: ['miro', 'figjam'] },
  { canonical: 'Canva', category: 'design', aliases: ['canva'] },
  { canonical: 'Usability Testing', category: 'design', aliases: ['usability testing', 'heuristic evaluation', 'user testing'] },
  { canonical: 'Slack', category: 'design', aliases: ['slack'] },
  { canonical: 'Microsoft Office', category: 'design', aliases: ['microsoft office', 'ms office', 'microsoft 365'] },
  { canonical: 'Asana / Trello', category: 'design', aliases: ['asana', 'trello', 'monday.com', 'clickup'] },
  { canonical: 'Postman', category: 'design', aliases: ['postman', 'swagger', 'openapi'] },
];
