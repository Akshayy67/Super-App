import React from "react";

interface BreadcrumbProps {
  path: { name: string; id: string | undefined }[];
  onNavigate: (folderId: string | undefined) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      {path.map((pathItem, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => {
              console.log(
                "🧭 Navigating to:",
                pathItem.name,
                "ID:",
                pathItem.id
              );
              onNavigate(pathItem.id);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {pathItem.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
