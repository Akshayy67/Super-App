// Resume Section Item Component (Draggable)
import React from "react";
import { GripVertical, Eye, EyeOff, Trash2, Edit2 } from "lucide-react";
import type { ResumeSection } from "../../types/resumeBuilder";
import { motion } from "framer-motion";

interface ResumeSectionItemProps {
  section: ResumeSection;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, section: ResumeSection) => void;
  onDragOver: (e: React.DragEvent, section: ResumeSection) => void;
  onDrop: (e: React.DragEvent, targetSection: ResumeSection) => void;
  onToggleVisibility: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
  onEdit: (section: ResumeSection) => void;
  index: number;
}

export const ResumeSectionItem: React.FC<ResumeSectionItemProps> = ({
  section,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onToggleVisibility,
  onDelete,
  onEdit,
  index,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, section);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e, section);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e, section);
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        group relative flex items-center gap-3 p-4 rounded-lg border-2
        bg-white dark:bg-slate-800
        border-gray-200 dark:border-slate-700
        hover:border-blue-400 dark:hover:border-blue-500
        transition-all duration-200 cursor-move
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Section Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {section.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {section.type.replace("-", " ")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleVisibility(section.id)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
          title={section.visible ? "Hide section" : "Show section"}
        >
          {section.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onEdit(section)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
          title="Edit section"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(section.id)}
          className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          title="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Order Badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300">
        {section.order + 1}
      </div>
    </motion.div>
  );
};

