import React, { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, X } from "lucide-react";

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  onTextInput: (text: string) => void;
  acceptedTypes: string[];
  maxSize: number;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  onTextInput,
  acceptedTypes,
  maxSize,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(
        maxSize / 1024 / 1024
      )}MB`;
    }

    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload, maxSize, acceptedTypes]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleTextSubmit = useCallback(() => {
    if (textValue.trim().length < 50) {
      setError("Resume text must be at least 50 characters long");
      return;
    }

    setError(null);
    onTextInput(textValue.trim());
  }, [textValue, onTextInput]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setInputMode("file")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "file"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "text"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Paste Text (Quick)
        </button>
      </div>

      {/* Info Message */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        💡 <strong>Tip:</strong> Upload PDF files for automatic text extraction,
        or use "Paste Text" for quick processing. DOCX files require copy-paste.
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {inputMode === "file" ? (
        /* File Upload Zone */
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && document.getElementById("file-input")?.click()
          }
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            disabled={disabled}
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Drop your resume here, or click to browse
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Supports {acceptedTypes.join(", ")} files up to{" "}
                {formatFileSize(maxSize)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                ✨ PDF files: Automatic text extraction | DOCX files: Copy-paste
                required
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>PDF, DOCX, TXT</span>
              </div>
              <div>•</div>
              <div>Max {formatFileSize(maxSize)}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Text Input Zone */
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Paste your resume text here... Include your work experience, skills, education, and any relevant information from your resume."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              disabled={disabled}
            />

            {/* Sample Data Button */}
            <button
              onClick={() =>
                setTextValue(`John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021-2024
• Developed and maintained React applications with TypeScript
• Built RESTful APIs using Node.js and Express
• Implemented CI/CD pipelines using Docker and AWS
• Led a team of 5 developers on multiple projects
• Improved application performance by 40%

Software Developer | StartupXYZ | 2019-2021
• Created responsive web applications using React and JavaScript
• Worked with PostgreSQL and MongoDB databases
• Collaborated with cross-functional teams using Agile methodology
• Implemented automated testing with Jest and Cypress

SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, Django, Spring Boot
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
Tools: Git, Jenkins, JIRA, Figma

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015-2019
GPA: 3.8/4.0

CERTIFICATIONS
AWS Certified Developer Associate (2023)
React Developer Certification (2022)`)
              }
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Use Sample Resume
            </button>

            {textValue && (
              <button
                onClick={() => setTextValue("")}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {textValue.length} characters (minimum 50 required)
            </p>

            <button
              onClick={handleTextSubmit}
              disabled={textValue.trim().length < 50 || disabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Use This Text
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          • Your resume will be parsed to extract skills, experience, and
          education
        </p>
        <p>
          • All data is processed securely and can be deleted after analysis
        </p>
        <p>
          • For best results, use a well-formatted resume with clear sections
        </p>
      </div>
    </div>
  );
};
