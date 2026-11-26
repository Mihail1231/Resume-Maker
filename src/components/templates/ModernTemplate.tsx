'use client';

import React, { useState } from 'react';
import { ResumeData, SectionId, SpacingStyles } from '@/types/resume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Linkedin, Github } from '@/components/icons/BrandIcons';

interface TemplateProps {
  data: ResumeData;
  s: SpacingStyles;
}

export default function ModernTemplate({ data, s }: TemplateProps) {
  const {
    personalInfo,
    summary,
    workExperience,
    education,
    projects,
    skills,
    languages,
    certifications,
    themeColor,
    showProfileImage,
  } = data;

  const [imgFailed, setImgFailed] = useState(false);

  const hasValidPhoto =
    !imgFailed &&
    Boolean(showProfileImage) &&
    Boolean(personalInfo.profileImage?.trim()) &&
    (personalInfo.profileImage!.startsWith('data:image/') ||
      personalInfo.profileImage!.startsWith('http'));

  const displayName = personalInfo.fullName?.trim() || 'Your Name';
  const displayHeadline =
    personalInfo.jobTitle?.trim() &&
    personalInfo.jobTitle.trim().toLowerCase() !== displayName.toLowerCase()
      ? personalInfo.jobTitle.trim()
      : '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + '-02');
      if (Number.isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:')
    ) {
      return url;
    }
    return `https://${url}`;
  };

  const contactItems = [
    personalInfo.email && {
      label: personalInfo.email,
      icon: Mail,
      href: `mailto:${personalInfo.email}`,
    },
    personalInfo.phone && { label: personalInfo.phone, icon: Phone },
    personalInfo.location && { label: personalInfo.location, icon: MapPin },
    personalInfo.linkedin && {
      label: personalInfo.linkedin,
      icon: Linkedin,
      href: getFullUrl(personalInfo.linkedin),
    },
    personalInfo.github && {
      label: personalInfo.github,
      icon: Github,
      href: getFullUrl(personalInfo.github),
    },
    personalInfo.website && {
      label: personalInfo.website,
      icon: Globe,
      href: getFullUrl(personalInfo.website),
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
  }[];

  const iconCls = s.isCompact ? 'w-[11px] h-[11px]' : 'w-3 h-3';

  return (
    <div className="flex flex-col text-slate-800 bg-white">
      {/* Top accent bar */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: themeColor }} />

      {/* Compact Horizontal Header with Inline Contact Bar */}
      <div
        className={`${s.headerPadding} border-b border-slate-200 flex items-center justify-between gap-3`}
      >
        <div className="min-w-0 flex-1">
          <h1
            className="font-bold tracking-tight text-slate-900"
            style={{ fontSize: s.fontName, lineHeight: '1.1' }}
          >
            {displayName}
          </h1>
          {displayHeadline && (
            <p
              className="font-semibold mt-0.5"
              style={{ color: themeColor, fontSize: s.fontBase, lineHeight: '1.25' }}
            >
              {displayHeadline}
            </p>
          )}
          {contactItems.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-slate-600 mt-1"
              style={{ fontSize: s.fontXs, lineHeight: '1.3' }}
            >
              {contactItems.map((item, idx) => {
                const inner = (
                  <>
                    <item.icon className={`${iconCls} shrink-0 text-slate-400`} />
                    <span>{item.label}</span>
                  </>
                );
                return (
                  <div key={idx} className="flex items-center gap-1">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                      >
                        {inner}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1">{inner}</span>
                    )}
                    {idx < contactItems.length - 1 && (
                      <span className="text-slate-300 ml-1 select-none">&middot;</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasValidPhoto && (
          <img
            src={personalInfo.profileImage}
            alt=""
            onError={() => setImgFailed(true)}
            className={`${s.photoSize} rounded-full object-cover border border-slate-200 shrink-0`}
          />
        )}
      </div>

      {/* Main Two-Column Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div
          className={`${
            s.isCompact ? 'w-[28%] px-4 py-3 gap-3' : 'w-[31%] px-5 py-4 gap-4'
          } bg-slate-50/70 border-r border-slate-100 flex flex-col`}
        >
          {(() => {
            const sidebarSectionIds: SectionId[] = ['skills', 'languages', 'certifications'];
            const order: SectionId[] = data.sectionOrder || [
              'summary',
              'education',
              'experience',
              'projects',
              'skills',
              'languages',
              'certifications',
            ];
            const orderedSidebar = sidebarSectionIds
              .filter((id) => order.includes(id))
              .sort((a, b) => order.indexOf(a) - order.indexOf(b));

            return orderedSidebar.map((id) => {
              switch (id) {
                case 'skills':
                  if (!skills || skills.length === 0) return null;
                  return (
                    <div key="skills">
                      <h3
                        className={`font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Skills
                      </h3>
                      {s.isCompact && skills.length > 16 ? (
                        <p
                          className="text-slate-700"
                          style={{ fontSize: s.fontXs, lineHeight: s.lineHeight }}
                        >
                          {skills.join(' · ')}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 rounded text-slate-700 bg-slate-200/70 font-medium"
                              style={{ fontSize: s.fontXs, lineHeight: '1.2' }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                case 'languages':
                  if (!languages || languages.length === 0) return null;
                  return (
                    <div key="languages">
                      <h3
                        className={`font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Languages
                      </h3>
                      <ul
                        className="space-y-0.5 text-slate-700"
                        style={{ fontSize: s.fontXs, lineHeight: s.lineHeight }}
                      >
                        {languages.map((lang, index) => (
                          <li key={index}>{lang}</li>
                        ))}
                      </ul>
                    </div>
                  );
                case 'certifications':
                  if (!certifications || certifications.length === 0) return null;
                  return (
                    <div key="certifications">
                      <h3
                        className={`font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Certifications
                      </h3>
                      <ul
                        className="space-y-1 text-slate-700"
                        style={{ fontSize: s.fontXs, lineHeight: s.lineHeight }}
                      >
                        {certifications.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  );
                default:
                  return null;
              }
            });
          })()}
        </div>

        {/* Right Main Column */}
        <div
          className={`${
            s.isCompact ? 'w-[72%] px-5 py-3' : 'w-[69%] px-6 py-4'
          } flex flex-col ${s.sectionGap}`}
        >
          {(() => {
            const mainSectionIds: SectionId[] = ['summary', 'experience', 'projects', 'education'];
            const order: SectionId[] = data.sectionOrder || [
              'summary',
              'education',
              'experience',
              'projects',
              'skills',
              'languages',
              'certifications',
            ];
            const orderedMain = mainSectionIds
              .filter((id) => order.includes(id))
              .sort((a, b) => order.indexOf(a) - order.indexOf(b));

            return orderedMain.map((id) => {
              switch (id) {
                case 'summary':
                  if (!summary) return null;
                  return (
                    <div key="summary">
                      <h3
                        className={`font-bold uppercase tracking-wider pb-0.5 border-b border-slate-200 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ color: themeColor, fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Profile
                      </h3>
                      <p
                        className="text-slate-700"
                        style={{ fontSize: s.fontBase, lineHeight: s.lineHeight }}
                      >
                        {summary}
                      </p>
                    </div>
                  );

                case 'experience':
                  if (!workExperience || workExperience.length === 0) return null;
                  return (
                    <div key="experience">
                      <h3
                        className={`font-bold uppercase tracking-wider pb-0.5 border-b border-slate-200 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ color: themeColor, fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Experience
                      </h3>
                      <div className={s.entryGap}>
                        {workExperience.map((exp) => (
                          <div key={exp.id} className="resume-entry break-inside-avoid">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="min-w-0">
                                <span
                                  className="font-bold text-slate-900"
                                  style={{ fontSize: s.fontLg, lineHeight: '1.25' }}
                                >
                                  {exp.position || exp.company}
                                </span>
                                {exp.position && exp.company && (
                                  <span
                                    className="font-semibold text-slate-600"
                                    style={{ fontSize: s.fontBase, lineHeight: '1.25' }}
                                  >
                                    {' '}
                                    &middot; {exp.company}
                                  </span>
                                )}
                              </div>
                              {(exp.startDate || exp.endDate || exp.current) && (
                                <span
                                  className="text-slate-500 font-medium shrink-0 tabular-nums"
                                  style={{ fontSize: s.fontXs, lineHeight: '1.25' }}
                                >
                                  {formatDate(exp.startDate)}
                                  {exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                                  {exp.current ? 'Present' : formatDate(exp.endDate)}
                                </span>
                              )}
                            </div>
                            {exp.location && !s.isCompact && (
                              <div className="text-slate-500" style={{ fontSize: s.fontXs }}>
                                {exp.location}
                              </div>
                            )}
                            {exp.description && exp.description.some((b) => b.trim()) && (
                              <ul
                                className={`list-disc list-outside ml-4 mt-0.5 text-slate-700 ${s.bulletGap}`}
                                style={{ fontSize: s.fontBase, lineHeight: s.lineHeight }}
                              >
                                {exp.description.map(
                                  (bullet, idx) => bullet.trim() && <li key={idx}>{bullet}</li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );

                case 'projects':
                  if (!projects || projects.length === 0) return null;
                  return (
                    <div key="projects">
                      <h3
                        className={`font-bold uppercase tracking-wider pb-0.5 border-b border-slate-200 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ color: themeColor, fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Projects &amp; Extracurricular
                      </h3>
                      <div className={s.entryGap}>
                        {projects.map((proj) => (
                          <div key={proj.id} className="resume-entry break-inside-avoid">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                                <span
                                  className="font-bold text-slate-900"
                                  style={{ fontSize: s.fontLg, lineHeight: '1.25' }}
                                >
                                  {proj.name}
                                </span>
                                {proj.role && (
                                  <span
                                    className="text-slate-600 font-medium"
                                    style={{ fontSize: s.fontXs, lineHeight: '1.25' }}
                                  >
                                    &middot; {proj.role}
                                  </span>
                                )}
                                {proj.githubLink && (
                                  <a
                                    href={getFullUrl(proj.githubLink)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-slate-500 hover:underline"
                                    style={{ fontSize: s.fontXs }}
                                  >
                                    <Github className="w-[10px] h-[10px] shrink-0" />
                                    <span>GitHub</span>
                                  </a>
                                )}
                                {proj.liveLink && (
                                  <a
                                    href={getFullUrl(proj.liveLink)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-slate-500 hover:underline"
                                    style={{ fontSize: s.fontXs }}
                                  >
                                    <Globe className="w-[10px] h-[10px] shrink-0" />
                                    <span>Live</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            {proj.description && proj.description.some((b) => b.trim()) && (
                              <ul
                                className={`list-disc list-outside ml-4 mt-0.5 text-slate-700 ${s.bulletGap}`}
                                style={{ fontSize: s.fontBase, lineHeight: s.lineHeight }}
                              >
                                {proj.description.map(
                                  (bullet, idx) => bullet.trim() && <li key={idx}>{bullet}</li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );

                case 'education':
                  if (!education || education.length === 0) return null;
                  return (
                    <div key="education">
                      <h3
                        className={`font-bold uppercase tracking-wider pb-0.5 border-b border-slate-200 break-after-avoid resume-section-heading ${s.headingMargin}`}
                        style={{ color: themeColor, fontSize: s.fontBase, lineHeight: '1.2' }}
                      >
                        Education
                      </h3>
                      <div className={s.entryGap}>
                        {education.map((edu) => (
                          <div key={edu.id} className="resume-entry break-inside-avoid">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="min-w-0">
                                <span
                                  className="font-bold text-slate-900"
                                  style={{ fontSize: s.fontLg, lineHeight: '1.25' }}
                                >
                                  {edu.school}
                                </span>
                                {edu.degree && (
                                  <span
                                    className="font-semibold text-slate-700"
                                    style={{ fontSize: s.fontBase, lineHeight: '1.25' }}
                                  >
                                    {' '}
                                    &middot; {edu.degree}
                                  </span>
                                )}
                                {edu.gpa && (
                                  <span
                                    className="text-slate-600 font-medium"
                                    style={{ fontSize: s.fontXs, lineHeight: '1.25' }}
                                  >
                                    {' '}
                                    (GPA: {edu.gpa})
                                  </span>
                                )}
                              </div>
                              {(edu.startDate || edu.endDate || edu.current) && (
                                <span
                                  className="text-slate-500 font-medium shrink-0 tabular-nums"
                                  style={{ fontSize: s.fontXs, lineHeight: '1.25' }}
                                >
                                  {formatDate(edu.startDate)}
                                  {edu.startDate && (edu.endDate || edu.current) ? ' – ' : ''}
                                  {edu.current ? 'Present' : formatDate(edu.endDate)}
                                </span>
                              )}
                            </div>
                            {edu.description && (
                              <p
                                className="text-slate-600 mt-0.5"
                                style={{ fontSize: s.fontXs, lineHeight: s.lineHeight }}
                              >
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            });
          })()}
        </div>
      </div>
    </div>
  );
}
