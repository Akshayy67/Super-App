// Resume Preview Component
import React from "react";
import type { ResumeData } from "../../types/resumeBuilder";
import { getTemplateById } from "../../utils/resumeTemplates";

interface ResumePreviewProps {
  resumeData: ResumeData;
  scale?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  scale = 1,
}) => {
  const template = getTemplateById(resumeData.template);

  const sortedSections = [...resumeData.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
      }}
    >
      <div className="p-8" style={{ minHeight: "297mm" }}>
        {/* Render sections based on template */}
        {template?.layout === "two-column" ? (
          <TwoColumnLayout sections={sortedSections} />
        ) : (
          <SingleColumnLayout sections={sortedSections} />
        )}
      </div>
    </div>
  );
};

// Single Column Layout
const SingleColumnLayout: React.FC<{ sections: any[] }> = ({ sections }) => {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};

// Two Column Layout
const TwoColumnLayout: React.FC<{ sections: any[] }> = ({ sections }) => {
  const headerSection = sections.find((s) => s.type === "header");
  const otherSections = sections.filter((s) => s.type !== "header");

  return (
    <div>
      {headerSection && <SectionRenderer section={headerSection} />}
      <div className="grid grid-cols-3 gap-8 mt-6">
        <div className="col-span-1 space-y-6">
          {otherSections
            .filter((s) => ["skills", "education", "certifications", "awards"].includes(s.type))
            .map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
        </div>
        <div className="col-span-2 space-y-6">
          {otherSections
            .filter((s) => !["skills", "education", "certifications", "awards"].includes(s.type))
            .map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
        </div>
      </div>
    </div>
  );
};

// Section Renderer
const SectionRenderer: React.FC<{ section: any }> = ({ section }) => {
  switch (section.type) {
    case "header":
      return <HeaderSection content={section.content} />;
    case "summary":
      return <SummarySection content={section.content} />;
    case "experience":
      return <ExperienceSection content={section.content} />;
    case "education":
      return <EducationSection content={section.content} />;
    case "skills":
      return <SkillsSection content={section.content} />;
    case "projects":
      return <ProjectsSection content={section.content} />;
    case "certifications":
      return <CertificationsSection content={section.content} />;
    case "awards":
      return <AwardsSection content={section.content} />;
    default:
      return null;
  }
};

// Header Section
const HeaderSection: React.FC<{ content: any }> = ({ content }) => {
  return (
    <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.fullName || ""}</h1>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {content.email && <span>{content.email}</span>}
        {content.phone && <span>{content.phone}</span>}
        {content.location && <span>{content.location}</span>}
      </div>
      {(content.linkedin || content.github || content.portfolio) && (
        <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-600 mt-2">
          {content.linkedin && <span>LinkedIn: {content.linkedin}</span>}
          {content.github && <span>GitHub: {content.github}</span>}
          {content.portfolio && <span>Portfolio: {content.portfolio}</span>}
        </div>
      )}
    </div>
  );
};

// Summary Section
const SummarySection: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
        Professional Summary
      </h2>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
};

// Experience Section
const ExperienceSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Work Experience
      </h2>
      <div className="space-y-4">
        {content.map((exp, idx) => (
          <div key={exp.id || idx} className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-semibold text-gray-900">{exp.jobTitle || ""}</h3>
                <p className="text-gray-600">{exp.company || ""}</p>
              </div>
              <span className="text-sm text-gray-500">
                {exp.startDate || ""} - {exp.endDate || ""}
              </span>
            </div>
            {exp.description && (
              <p className="text-gray-700 text-sm mb-2">{exp.description}</p>
            )}
            {exp.achievements && exp.achievements.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {exp.achievements.map((ach: string, i: number) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            )}
            {exp.technologies && exp.technologies.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Technologies: {exp.technologies.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Education Section
const EducationSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Education
      </h2>
      <div className="space-y-3">
        {content.map((edu, idx) => (
          <div key={edu.id || idx}>
            <h3 className="font-semibold text-gray-900">{edu.degree || ""}</h3>
            <p className="text-gray-600 text-sm">{edu.institution || ""}</p>
            <p className="text-gray-500 text-xs">
              {edu.startDate || ""} - {edu.endDate || ""}
              {edu.gpa && ` | GPA: ${edu.gpa}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skills Section
const SkillsSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {content.map((skill, idx) => (
          <span
            key={skill.id || idx}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};

// Projects Section
const ProjectsSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Projects
      </h2>
      <div className="space-y-4">
        {content.map((proj, idx) => (
          <div key={proj.id || idx} className="mb-4">
            <h3 className="font-semibold text-gray-900">{proj.name || ""}</h3>
            {proj.description && (
              <p className="text-gray-700 text-sm mb-2">{proj.description}</p>
            )}
            {proj.technologies && proj.technologies.length > 0 && (
              <p className="text-xs text-gray-500">
                Technologies: {proj.technologies.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Certifications Section
const CertificationsSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Certifications
      </h2>
      <div className="space-y-3">
        {content.map((cert, idx) => (
          <div key={cert.id || idx}>
            <h3 className="font-semibold text-gray-900">{cert.name || ""}</h3>
            <p className="text-gray-600 text-sm">
              {cert.issuer || ""}
              {cert.date && ` • ${cert.date}`}
            </p>
            {cert.credentialId && (
              <p className="text-xs text-gray-500">Credential ID: {cert.credentialId}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Awards Section
const AwardsSection: React.FC<{ content: any[] }> = ({ content }) => {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
        Honors & Awards
      </h2>
      <div className="space-y-3">
        {content.map((award, idx) => (
          <div key={award.id || idx}>
            <h3 className="font-semibold text-gray-900">{award.title || ""}</h3>
            {award.issuer && (
              <p className="text-gray-600 text-sm">
                {award.issuer}
                {award.date && ` • ${award.date}`}
              </p>
            )}
            {award.description && (
              <p className="text-gray-700 text-sm mt-1">{award.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

