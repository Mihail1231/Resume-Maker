import { ResumeData } from '@/types/resume';

export interface PresetJD {
  id: string;
  label: string;
  shortLabel: string;
  company: string;
  location: string;
  roleTrack: 'pm' | 'swe' | 'data';
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

export const PRESET_INTERNSHIP_JDS: PresetJD[] = [
  {
    id: 'pm-intern',
    label: 'Product Management Intern',
    shortLabel: 'PM Intern',
    company: 'CloudPulse',
    location: 'Seattle, WA / Hybrid',
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
