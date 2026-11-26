'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ResumeData,
  DEFAULT_RESUME_DATA,
  SAMPLE_RESUME_DATA,
  WorkExperience,
  Education,
  Project,
  TemplateName,
  SpacingOption,
  SectionId,
} from '@/types/resume';
import { STUDENT_SAMPLE_RESUME_DATA } from '@/lib/rolefit/demoData';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  updatePersonalInfo: (field: string, value: string) => void;
  updateProfileImage: (file: File) => void;
  removeProfileImage: () => void;
  updateSummary: (value: string) => void;

  addWorkExperience: () => void;
  updateWorkExperience: (id: string, field: string, value: string | boolean | string[]) => void;
  removeWorkExperience: (id: string) => void;
  moveWorkExperience: (id: string, direction: 'up' | 'down') => void;

  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string | boolean) => void;
  removeEducation: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, field: string, value: string | string[]) => void;
  removeProject: (id: string) => void;

  updateSkills: (skills: string[]) => void;
  addSkillTag: (skill: string) => void;
  appendBulletToEntry: (
    targetType: 'experience' | 'project',
    entryId: string,
    bulletText: string
  ) => void;
  replaceBulletText: (
    targetType: 'experience' | 'project',
    entryId: string,
    bulletIndex: number,
    newText: string
  ) => void;
  updateLanguages: (languages: string[]) => void;
  updateCertifications: (certifications: string[]) => void;

  setTemplate: (template: TemplateName) => void;
  setThemeColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setSpacing: (spacing: SpacingOption) => void;
  
  updateSectionOrder: (order: SectionId[]) => void;
  moveSection: (id: SectionId, direction: 'up' | 'down') => void;

  loadSampleData: () => void;
  loadStudentSampleData: () => void;
  importParsedResume: (data: ResumeData) => void;
  resetData: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'resume_maker_data';

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const initialLoadDone = useRef(false);

  // Load from query param (?sample=true) or localStorage on mount (static-export safe)
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const params = new URLSearchParams(window.location.search);
        const sampleParam = params.get('sample');
        if (sampleParam === 'true' || sampleParam === 'student') {
          setResumeData(STUDENT_SAMPLE_RESUME_DATA);
          initialLoadDone.current = true;
          return;
        }
        if (sampleParam === 'senior') {
          setResumeData(SAMPLE_RESUME_DATA);
          initialLoadDone.current = true;
          return;
        }

        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.sectionOrder) {
            parsed.sectionOrder = DEFAULT_RESUME_DATA.sectionOrder;
          }
          setResumeData(parsed);
        }
      } catch {
        // ignore parse errors
      }
      initialLoadDone.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
    } catch {
      // ignore quota errors
    }
  }, [resumeData]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, []);

  const updateProfileImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 300;
        let w = img.width;
        let h = img.height;
        if (w > MAX_SIZE || h > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setResumeData((prev) => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, profileImage: dataUrl },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const removeProfileImage = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, profileImage: undefined },
    }));
  }, []);

  const updateSummary = useCallback((value: string) => {
    setResumeData((prev) => ({ ...prev, summary: value }));
  }, []);

  // --- Work Experience ---
  const addWorkExperience = useCallback(() => {
    const newExp: WorkExperience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
    };
    setResumeData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp],
    }));
  }, []);

  const updateWorkExperience = useCallback(
    (id: string, field: string, value: string | boolean | string[]) => {
      setResumeData((prev) => ({
        ...prev,
        workExperience: prev.workExperience.map((exp) =>
          exp.id === id ? { ...exp, [field]: value } : exp
        ),
      }));
    },
    []
  );

  const removeWorkExperience = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }));
  }, []);

  const moveWorkExperience = useCallback((id: string, direction: 'up' | 'down') => {
    setResumeData((prev) => {
      const idx = prev.workExperience.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const newArr = [...prev.workExperience];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= newArr.length) return prev;
      [newArr[idx], newArr[swap]] = [newArr[swap], newArr[idx]];
      return { ...prev, workExperience: newArr };
    });
  }, []);

  // --- Education ---
  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: generateId(),
      school: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: string, value: string | boolean) => {
      setResumeData((prev) => ({
        ...prev,
        education: prev.education.map((edu) =>
          edu.id === id ? { ...edu, [field]: value } : edu
        ),
      }));
    },
    []
  );

  const removeEducation = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  }, []);

  // --- Projects ---
  const addProject = useCallback(() => {
    const newProj: Project = {
      id: generateId(),
      name: '',
      role: '',
      technologies: [],
      link: '',
      githubLink: '',
      liveLink: '',
      description: [''],
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  }, []);

  const updateProject = useCallback(
    (id: string, field: string, value: string | string[]) => {
      setResumeData((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) =>
          proj.id === id ? { ...proj, [field]: value } : proj
        ),
      }));
    },
    []
  );

  const removeProject = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  }, []);

  // --- Skills, Languages, Certifications ---
  const updateSkills = useCallback((skills: string[]) => {
    setResumeData((prev) => ({ ...prev, skills }));
  }, []);

  const addSkillTag = useCallback((skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setResumeData((prev) => {
      const alreadyExists = prev.skills.some(
        (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (alreadyExists) return prev;
      return { ...prev, skills: [...prev.skills, trimmed] };
    });
  }, []);

  const appendBulletToEntry = useCallback(
    (targetType: 'experience' | 'project', entryId: string, bulletText: string) => {
      const trimmed = bulletText.trim();
      if (!trimmed) return;

      if (targetType === 'experience') {
        setResumeData((prev) => ({
          ...prev,
          workExperience: prev.workExperience.map((exp) => {
            if (exp.id !== entryId) return exp;
            const hasOnlyBlank =
              exp.description.length === 1 && exp.description[0].trim() === '';
            return {
              ...exp,
              description: hasOnlyBlank ? [trimmed] : [...exp.description, trimmed],
            };
          }),
        }));
      } else {
        setResumeData((prev) => ({
          ...prev,
          projects: prev.projects.map((proj) => {
            if (proj.id !== entryId) return proj;
            const hasOnlyBlank =
              proj.description.length === 1 && proj.description[0].trim() === '';
            return {
              ...proj,
              description: hasOnlyBlank ? [trimmed] : [...proj.description, trimmed],
            };
          }),
        }));
      }
    },
    []
  );

  const replaceBulletText = useCallback(
    (
      targetType: 'experience' | 'project',
      entryId: string,
      bulletIndex: number,
      newText: string
    ) => {
      const trimmed = newText.trim();
      if (!trimmed) return;

      if (targetType === 'experience') {
        setResumeData((prev) => ({
          ...prev,
          workExperience: prev.workExperience.map((exp) => {
            if (exp.id !== entryId) return exp;
            if (bulletIndex < 0 || bulletIndex >= exp.description.length) return exp;
            const nextDesc = [...exp.description];
            nextDesc[bulletIndex] = trimmed;
            return { ...exp, description: nextDesc };
          }),
        }));
      } else {
        setResumeData((prev) => ({
          ...prev,
          projects: prev.projects.map((proj) => {
            if (proj.id !== entryId) return proj;
            if (bulletIndex < 0 || bulletIndex >= proj.description.length) return proj;
            const nextDesc = [...proj.description];
            nextDesc[bulletIndex] = trimmed;
            return { ...proj, description: nextDesc };
          }),
        }));
      }
    },
    []
  );

  const updateLanguages = useCallback((languages: string[]) => {
    setResumeData((prev) => ({ ...prev, languages }));
  }, []);

  const updateCertifications = useCallback((certifications: string[]) => {
    setResumeData((prev) => ({ ...prev, certifications }));
  }, []);

  // --- Theme ---
  const setTemplate = useCallback((template: TemplateName) => {
    setResumeData((prev) => ({ ...prev, template }));
  }, []);

  const setThemeColor = useCallback((color: string) => {
    setResumeData((prev) => ({ ...prev, themeColor: color }));
  }, []);

  const setFontFamily = useCallback((font: string) => {
    setResumeData((prev) => ({ ...prev, fontFamily: font }));
  }, []);

  const setSpacing = useCallback((spacing: SpacingOption) => {
    setResumeData((prev) => ({ ...prev, spacing }));
  }, []);

  const updateSectionOrder = useCallback((order: SectionId[]) => {
    setResumeData((prev) => ({ ...prev, sectionOrder: order }));
  }, []);

  const moveSection = useCallback((id: SectionId, direction: 'up' | 'down') => {
    setResumeData((prev) => {
      const order = prev.sectionOrder || DEFAULT_RESUME_DATA.sectionOrder || [];
      const idx = order.indexOf(id);
      if (idx === -1) return prev;
      const newOrder = [...order];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= newOrder.length) return prev;
      [newOrder[idx], newOrder[swap]] = [newOrder[swap], newOrder[idx]];
      return { ...prev, sectionOrder: newOrder };
    });
  }, []);

  // --- Data operations ---
  const loadSampleData = useCallback(() => {
    setResumeData(SAMPLE_RESUME_DATA);
  }, []);

  const loadStudentSampleData = useCallback(() => {
    setResumeData(STUDENT_SAMPLE_RESUME_DATA);
  }, []);

  const importParsedResume = useCallback((data: ResumeData) => {
    const normalized: ResumeData = {
      ...DEFAULT_RESUME_DATA,
      ...data,
      personalInfo: {
        ...DEFAULT_RESUME_DATA.personalInfo,
        ...data.personalInfo,
      },
      sectionOrder:
        data.sectionOrder && data.sectionOrder.length > 0
          ? data.sectionOrder
          : DEFAULT_RESUME_DATA.sectionOrder,
    };
    setResumeData(normalized);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const resetData = useCallback(() => {
    setResumeData(DEFAULT_RESUME_DATA);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resumeData]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.sectionOrder) {
          parsed.sectionOrder = DEFAULT_RESUME_DATA.sectionOrder;
        }
        setResumeData(parsed);
      } catch {
        alert('Invalid JSON file. Please select a valid resume data file.');
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        updatePersonalInfo,
        updateProfileImage,
        removeProfileImage,
        updateSummary,
        addWorkExperience,
        updateWorkExperience,
        removeWorkExperience,
        moveWorkExperience,
        addEducation,
        updateEducation,
        removeEducation,
        addProject,
        updateProject,
        removeProject,
        updateSkills,
        addSkillTag,
        appendBulletToEntry,
        replaceBulletText,
        updateLanguages,
        updateCertifications,
        setTemplate,
        setThemeColor,
        setFontFamily,
        setSpacing,
        updateSectionOrder,
        moveSection,
        loadSampleData,
        loadStudentSampleData,
        importParsedResume,
        resetData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
