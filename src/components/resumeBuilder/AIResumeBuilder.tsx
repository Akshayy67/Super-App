// Main AI Resume Builder Component
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Download,
  FileText,
  Sparkles,
  Settings,
  Plus,
  FileUp,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ResumeData,
  ResumeSection,
  JobDescription,
  AIEnhancementResult,
  ExportOptions,
} from "../../types/resumeBuilder";
import { DEFAULT_RESUME_DATA, RESUME_TEMPLATES, createResumeFromTemplate } from "../../utils/resumeTemplates";
import { ResumeStorage } from "../../utils/resumeStorage";
import { ResumeExport } from "../../utils/resumeExport";
import { ResumeAIService } from "../../services/resumeAIService";
import { ResumeSectionItem } from "./ResumeSectionItem";
import { SectionEditor } from "./SectionEditor";
import { ResumePreview } from "./ResumePreview";
import { AIFeedbackPanel } from "./AIFeedbackPanel";
import { ResumeImportModal } from "./ResumeImportModal";

interface AIResumeBuilderProps {
  theme?: "modern" | "classic" | "minimal";
  aiEnhancementEnabled?: boolean;
  matchScoreEnabled?: boolean;
  className?: string;
}

export const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({
  theme = "modern",
  aiEnhancementEnabled = true,
  matchScoreEnabled = true,
  className = "",
}) => {
  // State
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIEnhancementResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedSection, setDraggedSection] = useState<ResumeSection | null>(null);
  const [editingSection, setEditingSection] = useState<ResumeSection | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showJDInput, setShowJDInput] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved resume on mount
  useEffect(() => {
    const saved = ResumeStorage.loadFromLocal();
    if (saved) {
      setResumeData(saved);
      setLastSaved(new Date(saved.metadata.updatedAt));
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [resumeData]);

  const handleAutoSave = useCallback(async () => {
    try {
      await ResumeStorage.autoSave({
        ...resumeData,
        metadata: {
          ...resumeData.metadata,
          updatedAt: new Date().toISOString(),
        },
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [resumeData]);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, section: ResumeSection) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, section: ResumeSection) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetSection: ResumeSection) => {
      e.preventDefault();
      if (!draggedSection || draggedSection.id === targetSection.id) {
        setDraggedSection(null);
        return;
      }

      const sections = [...resumeData.sections];
      const draggedIndex = sections.findIndex((s) => s.id === draggedSection.id);
      const targetIndex = sections.findIndex((s) => s.id === targetSection.id);

      // Swap orders
      const draggedOrder = sections[draggedIndex].order;
      sections[draggedIndex].order = sections[targetIndex].order;
      sections[targetIndex].order = draggedOrder;

      setResumeData({ ...resumeData, sections });
      setDraggedSection(null);
    },
    [draggedSection, resumeData]
  );

  // Section Management
  const handleAddSection = useCallback((type: ResumeSection["type"]) => {
    const newSection: ResumeSection = {
      id: `${type}_${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
      content: type === "summary" ? "" : [],
      order: resumeData.sections.length,
      visible: true,
    };

    setResumeData({
      ...resumeData,
      sections: [...resumeData.sections, newSection],
    });
  }, [resumeData]);

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (window.confirm("Are you sure you want to delete this section?")) {
        setResumeData({
          ...resumeData,
          sections: resumeData.sections.filter((s) => s.id !== sectionId),
        });
      }
    },
    [resumeData]
  );

  const handleToggleVisibility = useCallback(
    (sectionId: string) => {
      setResumeData({
        ...resumeData,
        sections: resumeData.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s
        ),
      });
    },
    [resumeData]
  );

  const handleUpdateSection = useCallback(
    (updatedSection: ResumeSection) => {
      setResumeData({
        ...resumeData,
        sections: resumeData.sections.map((s) =>
          s.id === updatedSection.id ? updatedSection : s
        ),
      });
      setEditingSection(null);
    },
    [resumeData]
  );

  // Template Management
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const template = RESUME_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setResumeData({
          ...resumeData,
          template: templateId,
        });
      }
    },
    [resumeData]
  );

  // AI Enhancement
  const handleAnalyzeJD = useCallback(async () => {
    if (!jobDescription?.text.trim()) {
      alert("Please enter a job description");
      return;
    }

    setIsLoadingAI(true);
    try {
      const enhancement = await ResumeAIService.enhanceResume(resumeData, jobDescription);
      setAiFeedback(enhancement);
    } catch (error) {
      console.error("AI enhancement failed:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [resumeData, jobDescription]);

  const handleApplyEnhancements = useCallback(
    (enhancements: AIEnhancementResult) => {
      const updatedSections = [...resumeData.sections];

      // Update summary
      if (enhancements.enhancedSections.summary) {
        const summarySection = updatedSections.find((s) => s.type === "summary");
        if (summarySection) {
          summarySection.content = enhancements.enhancedSections.summary;
        }
      }

      // Update experience
      if (enhancements.enhancedSections.experience) {
        const expSection = updatedSections.find((s) => s.type === "experience");
        if (expSection) {
          expSection.content = enhancements.enhancedSections.experience;
        }
      }

      // Update skills
      if (enhancements.enhancedSections.skills) {
        const skillsSection = updatedSections.find((s) => s.type === "skills");
        if (skillsSection) {
          skillsSection.content = enhancements.enhancedSections.skills;
        }
      }

      // Update projects
      if (enhancements.enhancedSections.projects) {
        const projectsSection = updatedSections.find((s) => s.type === "projects");
        if (projectsSection) {
          projectsSection.content = enhancements.enhancedSections.projects;
        }
      }

      setResumeData({ ...resumeData, sections: updatedSections });
      setAiFeedback(null);
      alert("AI enhancements applied successfully!");
    },
    [resumeData]
  );

  // Export
  const handleExport = useCallback(
    async (format: "pdf" | "docx" | "json") => {
      try {
        let blob: Blob;
        let filename: string;

        if (format === "pdf") {
          blob = await ResumeExport.exportToPDF(resumeData);
          filename = `${resumeData.name || "resume"}.pdf`;
        } else if (format === "json") {
          blob = ResumeExport.exportToJSON(resumeData);
          filename = `${resumeData.name || "resume"}.json`;
        } else {
          alert("DOCX export coming soon!");
          return;
        }

        ResumeExport.downloadBlob(blob, filename);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export resume. Please try again.");
      }
    },
    [resumeData]
  );

  // Manual Save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await ResumeStorage.autoSave({
        ...resumeData,
        metadata: {
          ...resumeData.metadata,
          updatedAt: new Date().toISOString(),
        },
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [resumeData]);

  // Handle resume import
  const handleImportResume = useCallback((importedResume: ResumeData) => {
    // Merge imported sections with existing ones, avoiding duplicates
    const existingSectionTypes = new Set(resumeData.sections.map((s) => s.type));
    const newSections = importedResume.sections.filter(
      (s) => !existingSectionTypes.has(s.type)
    );
    
    // Update existing sections with imported data if they match
    const updatedSections = resumeData.sections.map((existing) => {
      const imported = importedResume.sections.find((s) => s.type === existing.type);
      return imported ? { ...existing, content: imported.content } : existing;
    });

    setResumeData({
      ...importedResume,
      sections: [...updatedSections, ...newSections],
      template: resumeData.template, // Keep current template
    });
    
    setShowImportModal(false);
  }, [resumeData]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={resumeData.name}
                onChange={(e) =>
                  setResumeData({ ...resumeData, name: e.target.value })
                }
                className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 w-full"
                placeholder="My Resume"
              />
              {lastSaved && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                title="Import existing resume"
              >
                <Upload className="w-4 h-4" />
                Import Resume
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>

              <div className="relative group">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport("json")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Sections & Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Job Description Input */}
            {aiEnhancementEnabled && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Enhancement
                  </h3>
                  <button
                    onClick={() => setShowJDInput(!showJDInput)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showJDInput ? "Hide" : "Show"}
                  </button>
                </div>

                <AnimatePresence>
                  {showJDInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3"
                    >
                      <textarea
                        value={jobDescription?.text || ""}
                        onChange={(e) =>
                          setJobDescription({
                            text: e.target.value,
                            title: jobDescription?.title,
                            company: jobDescription?.company,
                          })
                        }
                        placeholder="Paste job description here..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                      />
                      <button
                        onClick={handleAnalyzeJD}
                        disabled={isLoadingAI || !jobDescription?.text.trim()}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isLoadingAI ? "Analyzing..." : "Analyze & Enhance"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* AI Feedback Panel */}
            {aiEnhancementEnabled && (
              <AIFeedbackPanel
                feedback={aiFeedback}
                isLoading={isLoadingAI}
                onApplyEnhancements={handleApplyEnhancements}
              />
            )}

            {/* Template Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Templates
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {RESUME_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${
                        resumeData.template === template.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                      }
                    `}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sections</h3>
                <div className="relative group">
                  <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {[
                      "experience",
                      "education",
                      "skills",
                      "projects",
                      "certifications",
                      "awards",
                      "summary",
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleAddSection(type as any)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 capitalize"
                      >
                        Add {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {resumeData.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, idx) => (
                    <ResumeSectionItem
                      key={section.id}
                      section={section}
                      index={idx}
                      isDragging={draggedSection?.id === section.id}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDeleteSection}
                      onEdit={setEditingSection}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sticky top-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Resume Preview
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Scale:</span>
                      <select
                        onChange={(e) => {
                          // Scale control can be added here
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                        defaultValue="1"
                      >
                        <option value="0.5">50%</option>
                        <option value="0.75">75%</option>
                        <option value="1">100%</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[calc(100vh-200px)] border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900">
                    <ResumePreview resumeData={resumeData} scale={1} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleUpdateSection}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* Resume Import Modal */}
      <ResumeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportResume}
      />
    </div>
  );
};

