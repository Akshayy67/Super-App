// Section Editor Component (for editing section content)
import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import type {
  ResumeSection,
  HeaderSection,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AwardItem,
} from "../../types/resumeBuilder";
import { motion, AnimatePresence } from "framer-motion";

interface SectionEditorProps {
  section: ResumeSection;
  onSave: (section: ResumeSection) => void;
  onClose: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onClose,
}) => {
  const [editedContent, setEditedContent] = useState<any>(section.content);

  useEffect(() => {
    setEditedContent(section.content);
  }, [section]);

  const handleSave = () => {
    onSave({
      ...section,
      content: editedContent,
    });
    onClose();
  };

  const renderEditor = () => {
    switch (section.type) {
      case "header":
        return <HeaderEditor content={editedContent} onChange={setEditedContent} />;
      case "summary":
        return <SummaryEditor content={editedContent} onChange={setEditedContent} />;
      case "experience":
        return <ExperienceEditor content={editedContent} onChange={setEditedContent} />;
      case "education":
        return <EducationEditor content={editedContent} onChange={setEditedContent} />;
      case "skills":
        return <SkillsEditor content={editedContent} onChange={setEditedContent} />;
      case "projects":
        return <ProjectsEditor content={editedContent} onChange={setEditedContent} />;
      case "certifications":
        return <CertificationsEditor content={editedContent} onChange={setEditedContent} />;
      case "awards":
        return <AwardsEditor content={editedContent} onChange={setEditedContent} />;
      default:
        return <GenericEditor content={editedContent} onChange={setEditedContent} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Edit {section.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderEditor()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Header Editor
const HeaderEditor: React.FC<{
  content: HeaderSection;
  onChange: (content: HeaderSection) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={content.fullName || ""}
          onChange={(e) => onChange({ ...content, fullName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={content.email || ""}
            onChange={(e) => onChange({ ...content, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={content.phone || ""}
            onChange={(e) => onChange({ ...content, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location
        </label>
        <input
          type="text"
          value={content.location || ""}
          onChange={(e) => onChange({ ...content, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={content.linkedin || ""}
            onChange={(e) => onChange({ ...content, linkedin: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub
          </label>
          <input
            type="url"
            value={content.github || ""}
            onChange={(e) => onChange({ ...content, github: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Portfolio
          </label>
          <input
            type="url"
            value={content.portfolio || ""}
            onChange={(e) => onChange({ ...content, portfolio: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

// Summary Editor
const SummaryEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
}> = ({ content, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Professional Summary
      </label>
      <textarea
        value={content || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
        placeholder="Write a compelling professional summary..."
      />
    </div>
  );
};

// Experience Editor
const ExperienceEditor: React.FC<{
  content: ExperienceItem[];
  onChange: (content: ExperienceItem[]) => void;
}> = ({ content, onChange }) => {
  const addExperience = () => {
    onChange([
      ...(content || []),
      {
        id: `exp_${Date.now()}`,
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "Present",
        description: "",
        achievements: [],
        technologies: [],
      },
    ]);
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange(
      (content || []).map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    );
  };

  const deleteExperience = (id: string) => {
    onChange((content || []).filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Work Experience
        </h3>
        <button
          onClick={addExperience}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>
      {(content || []).map((exp) => (
        <div
          key={exp.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Experience #{content.indexOf(exp) + 1}
            </h4>
            <button
              onClick={() => deleteExperience(exp.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Job Title"
              value={exp.jobTitle || ""}
              onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Company"
              value={exp.company || ""}
              onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Start Date (YYYY-MM)"
              value={exp.startDate || ""}
              onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="End Date or 'Present'"
              value={exp.endDate || ""}
              onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Location (optional)"
              value={exp.location || ""}
              onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <textarea
            placeholder="Job Description"
            value={exp.description || ""}
            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>
      ))}
    </div>
  );
};

// Education Editor
const EducationEditor: React.FC<{
  content: EducationItem[];
  onChange: (content: EducationItem[]) => void;
}> = ({ content, onChange }) => {
  const addEducation = () => {
    onChange([
      ...(content || []),
      {
        id: `edu_${Date.now()}`,
        degree: "",
        institution: "",
        startDate: "",
        endDate: "Present",
      },
    ]);
  };

  const updateEducation = (id: string, updates: Partial<EducationItem>) => {
    onChange(
      (content || []).map((edu) => (edu.id === id ? { ...edu, ...updates } : edu))
    );
  };

  const deleteEducation = (id: string) => {
    onChange((content || []).filter((edu) => edu.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Education
        </h3>
        <button
          onClick={addEducation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
      {(content || []).map((edu) => (
        <div
          key={edu.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Education #{content.indexOf(edu) + 1}
            </h4>
            <button
              onClick={() => deleteEducation(edu.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Degree"
              value={edu.degree || ""}
              onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Institution"
              value={edu.institution || ""}
              onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Start Date (YYYY-MM)"
              value={edu.startDate || ""}
              onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="End Date or 'Present'"
              value={edu.endDate || ""}
              onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="GPA (optional)"
              value={edu.gpa || ""}
              onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skills Editor
const SkillsEditor: React.FC<{
  content: SkillItem[];
  onChange: (content: SkillItem[]) => void;
}> = ({ content, onChange }) => {
  const [newSkill, setNewSkill] = useState({ name: "", category: "" });

  const addSkill = () => {
    if (newSkill.name.trim()) {
      onChange([
        ...(content || []),
        {
          id: `skill_${Date.now()}`,
          name: newSkill.name,
          category: newSkill.category || "General",
        },
      ]);
      setNewSkill({ name: "", category: "" });
    }
  };

  const deleteSkill = (id: string) => {
    onChange((content || []).filter((skill) => skill.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Skill Name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          onKeyPress={(e) => e.key === "Enter" && addSkill()}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Category (optional)"
          value={newSkill.category}
          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(content || []).map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200"
          >
            <span>{skill.name}</span>
            <button
              onClick={() => deleteSkill(skill.id)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Projects Editor
const ProjectsEditor: React.FC<{
  content: ProjectItem[];
  onChange: (content: ProjectItem[]) => void;
}> = ({ content, onChange }) => {
  const addProject = () => {
    onChange([
      ...(content || []),
      {
        id: `proj_${Date.now()}`,
        name: "",
        description: "",
        technologies: [],
      },
    ]);
  };

  const updateProject = (id: string, updates: Partial<ProjectItem>) => {
    onChange(
      (content || []).map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );
  };

  const deleteProject = (id: string) => {
    onChange((content || []).filter((proj) => proj.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Projects
        </h3>
        <button
          onClick={addProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>
      {(content || []).map((proj) => (
        <div
          key={proj.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Project #{content.indexOf(proj) + 1}
            </h4>
            <button
              onClick={() => deleteProject(proj.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Project Name"
            value={proj.name || ""}
            onChange={(e) => updateProject(proj.id, { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
          <textarea
            placeholder="Project Description"
            value={proj.description || ""}
            onChange={(e) => updateProject(proj.id, { description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>
      ))}
    </div>
  );
};

// Certifications Editor
const CertificationsEditor: React.FC<{
  content: CertificationItem[];
  onChange: (content: CertificationItem[]) => void;
}> = ({ content, onChange }) => {
  const addCertification = () => {
    onChange([
      ...(content || []),
      {
        id: `cert_${Date.now()}`,
        name: "",
        issuer: "",
        date: "",
      },
    ]);
  };

  const updateCertification = (id: string, updates: Partial<CertificationItem>) => {
    onChange(
      (content || []).map((cert) => (cert.id === id ? { ...cert, ...updates } : cert))
    );
  };

  const deleteCertification = (id: string) => {
    onChange((content || []).filter((cert) => cert.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Certifications
        </h3>
        <button
          onClick={addCertification}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
      {(content || []).map((cert) => (
        <div
          key={cert.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Certification #{content.indexOf(cert) + 1}
            </h4>
            <button
              onClick={() => deleteCertification(cert.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Certification Name"
              value={cert.name || ""}
              onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Issuing Organization"
              value={cert.issuer || ""}
              onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Date (YYYY-MM)"
              value={cert.date || ""}
              onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Expiry Date (optional)"
              value={cert.expiryDate || ""}
              onChange={(e) => updateCertification(cert.id, { expiryDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Credential ID (optional)"
              value={cert.credentialId || ""}
              onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <input
            type="url"
            placeholder="URL (optional)"
            value={cert.url || ""}
            onChange={(e) => updateCertification(cert.id, { url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      ))}
    </div>
  );
};

// Awards Editor
const AwardsEditor: React.FC<{
  content: AwardItem[];
  onChange: (content: AwardItem[]) => void;
}> = ({ content, onChange }) => {
  const addAward = () => {
    onChange([
      ...(content || []),
      {
        id: `award_${Date.now()}`,
        title: "",
        issuer: "",
        date: "",
        description: "",
      },
    ]);
  };

  const updateAward = (id: string, updates: Partial<AwardItem>) => {
    onChange(
      (content || []).map((award) => (award.id === id ? { ...award, ...updates } : award))
    );
  };

  const deleteAward = (id: string) => {
    onChange((content || []).filter((award) => award.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Honors & Awards
        </h3>
        <button
          onClick={addAward}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Award
        </button>
      </div>
      {(content || []).map((award) => (
        <div
          key={award.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Award #{content.indexOf(award) + 1}
            </h4>
            <button
              onClick={() => deleteAward(award.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Award Title"
            value={award.title || ""}
            onChange={(e) => updateAward(award.id, { title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Issuing Organization"
              value={award.issuer || ""}
              onChange={(e) => updateAward(award.id, { issuer: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Date (YYYY-MM)"
              value={award.date || ""}
              onChange={(e) => updateAward(award.id, { date: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={award.description || ""}
            onChange={(e) => updateAward(award.id, { description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={award.url || ""}
            onChange={(e) => updateAward(award.id, { url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      ))}
    </div>
  );
};

// Generic Editor
const GenericEditor: React.FC<{
  content: any;
  onChange: (content: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Content
      </label>
      <textarea
        value={JSON.stringify(content, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            // Invalid JSON, ignore
          }
        }}
        rows={10}
        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
      />
    </div>
  );
};

