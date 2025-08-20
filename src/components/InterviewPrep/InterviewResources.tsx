import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckSquare,
  Mail,
  FileSpreadsheet,
  BookOpen,
  Link,
  ExternalLink,
  Star,
  Clock,
  Filter,
  Search,
  Folder,
  ChevronRight,
  Award,
  Briefcase,
  Users,
  Target,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "template" | "checklist" | "guide" | "link";
  type: string;
  icon: React.ElementType;
  downloadUrl?: string;
  previewContent?: string;
  tags: string[];
  isPremium?: boolean;
  popularity: number;
}

interface ResourceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  resources: Resource[];
}

export const InterviewResources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const resources: Resource[] = [
    // Resume Templates
    {
      id: "res-1",
      title: "Professional Resume Template",
      description: "Clean, ATS-friendly resume template suitable for all industries",
      category: "template",
      type: "resume",
      icon: FileText,
      tags: ["resume", "template", "professional"],
      popularity: 95,
      previewContent: `JOHN DOE
Senior Software Engineer

CONTACT
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years...

EXPERIENCE
Senior Software Engineer | TechCorp
2020 - Present
• Led development of microservices architecture
• Improved system performance by 40%

EDUCATION
BS Computer Science | University Name
2015 - 2019

SKILLS
Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Spring Boot`,
    },
    {
      id: "res-2",
      title: "Creative Resume Template",
      description: "Modern, visually appealing template for creative roles",
      category: "template",
      type: "resume",
      icon: FileText,
      tags: ["resume", "creative", "design"],
      popularity: 85,
      isPremium: true,
    },
    {
      id: "res-3",
      title: "Executive Resume Template",
      description: "Professional template for senior leadership positions",
      category: "template",
      type: "resume",
      icon: FileText,
      tags: ["resume", "executive", "leadership"],
      popularity: 78,
    },

    // Cover Letters
    {
      id: "res-4",
      title: "Cover Letter Template",
      description: "Structured cover letter template with proven format",
      category: "template",
      type: "cover-letter",
      icon: Mail,
      tags: ["cover letter", "template"],
      popularity: 88,
      previewContent: `Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my [X years] of experience in [relevant field], I am confident I would be a valuable addition to your team.

In my current role as [Current Position] at [Current Company], I have:
• [Achievement 1]
• [Achievement 2]
• [Achievement 3]

I am particularly drawn to [Company Name] because [specific reason related to company/role]. I believe my skills in [relevant skills] align perfectly with your needs.

I would welcome the opportunity to discuss how my experience and passion can contribute to [Company Name]'s continued success.

Thank you for your consideration.

Sincerely,
[Your Name]`,
    },
    {
      id: "res-5",
      title: "Thank You Email Template",
      description: "Post-interview thank you email templates",
      category: "template",
      type: "email",
      icon: Mail,
      tags: ["email", "thank you", "follow-up"],
      popularity: 92,
    },

    // Checklists
    {
      id: "res-6",
      title: "Pre-Interview Checklist",
      description: "Complete checklist to prepare for your interview",
      category: "checklist",
      type: "preparation",
      icon: CheckSquare,
      tags: ["checklist", "preparation"],
      popularity: 96,
      previewContent: `PRE-INTERVIEW CHECKLIST

□ Research the company
  □ Company mission and values
  □ Recent news and achievements
  □ Products/services
  □ Competitors

□ Research interviewers on LinkedIn

□ Prepare your outfit
  □ Clean and pressed
  □ Appropriate for company culture
  □ Backup outfit ready

□ Prepare documents
  □ Multiple copies of resume
  □ Portfolio/work samples
  □ References list
  □ Notepad and pen

□ Plan your route
  □ Know the location
  □ Plan for traffic
  □ Arrive 15 minutes early

□ Prepare questions to ask
  □ About the role
  □ About the team
  □ About growth opportunities

□ Practice common questions
□ Review your resume
□ Get good night's sleep`,
    },
    {
      id: "res-7",
      title: "Post-Interview Checklist",
      description: "Steps to take after your interview",
      category: "checklist",
      type: "follow-up",
      icon: CheckSquare,
      tags: ["checklist", "follow-up"],
      popularity: 82,
    },
    {
      id: "res-8",
      title: "First Day Checklist",
      description: "What to do on your first day at a new job",
      category: "checklist",
      type: "onboarding",
      icon: CheckSquare,
      tags: ["checklist", "first day", "onboarding"],
      popularity: 75,
    },

    // Guides
    {
      id: "res-9",
      title: "Salary Negotiation Guide",
      description: "Complete guide to negotiating your salary offer",
      category: "guide",
      type: "negotiation",
      icon: BookOpen,
      tags: ["guide", "salary", "negotiation"],
      popularity: 94,
      isPremium: true,
    },
    {
      id: "res-10",
      title: "STAR Method Guide",
      description: "How to structure behavioral interview answers",
      category: "guide",
      type: "interview",
      icon: BookOpen,
      tags: ["guide", "STAR", "behavioral"],
      popularity: 90,
      previewContent: `THE STAR METHOD

Situation: Set the context
• When and where did this happen?
• What was your role?
• Who else was involved?

Task: Explain the challenge
• What needed to be done?
• What were the objectives?
• What were the constraints?

Action: Describe what you did
• What specific steps did you take?
• What was your thought process?
• How did you overcome obstacles?

Result: Share the outcome
• What was achieved?
• What did you learn?
• How did it impact the business?

EXAMPLE:
S: "In my role as Project Manager at XYZ Company..."
T: "I was tasked with reducing project delivery time by 20%..."
A: "I implemented an agile methodology, reorganized teams..."
R: "We achieved a 25% reduction in delivery time and improved quality..."`,
    },
    {
      id: "res-11",
      title: "Industry Research Template",
      description: "Framework for researching companies and industries",
      category: "guide",
      type: "research",
      icon: BookOpen,
      tags: ["guide", "research", "preparation"],
      popularity: 79,
    },

    // External Links
    {
      id: "res-12",
      title: "LinkedIn Profile Optimization",
      description: "Guide to optimizing your LinkedIn profile for job search",
      category: "link",
      type: "external",
      icon: Link,
      tags: ["LinkedIn", "profile", "optimization"],
      popularity: 91,
    },
    {
      id: "res-13",
      title: "Interview Practice Platform",
      description: "Free platform for practicing video interviews",
      category: "link",
      type: "external",
      icon: Link,
      tags: ["practice", "video", "platform"],
      popularity: 86,
    },
  ];

  const resourceCategories: ResourceCategory[] = [
    {
      id: "templates",
      name: "Templates",
      icon: FileText,
      color: "blue",
      resources: resources.filter((r) => r.category === "template"),
    },
    {
      id: "checklists",
      name: "Checklists",
      icon: CheckSquare,
      color: "green",
      resources: resources.filter((r) => r.category === "checklist"),
    },
    {
      id: "guides",
      name: "Guides",
      icon: BookOpen,
      color: "purple",
      resources: resources.filter((r) => r.category === "guide"),
    },
    {
      id: "links",
      name: "External Resources",
      icon: Link,
      color: "orange",
      resources: resources.filter((r) => r.category === "link"),
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return colors[color] || "bg-gray-100 text-gray-600";
  };

  const handleDownload = (resource: Resource) => {
    // In a real app, this would trigger a download
    console.log(`Downloading ${resource.title}`);
  };

  const handlePreview = (resourceId: string) => {
    setShowPreview(showPreview === resourceId ? null : resourceId);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Interview Resources Library</h2>
            <p className="text-green-100 mb-4">
              Templates, checklists, and guides to ace your interview
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">{resources.length} Resources</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span className="text-sm">Instant Download</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Expert Curated</span>
              </div>
            </div>
          </div>
          <Folder className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="template">Templates</option>
              <option value="checklist">Checklists</option>
              <option value="guide">Guides</option>
              <option value="link">External Links</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {selectedCategory === "all" && searchQuery === "" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.resources[0]?.category || "all")}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.resources.length} items</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => {
          const Icon = resource.icon;
          const isPreviewOpen = showPreview === resource.id;

          return (
            <div
              key={resource.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        {resource.title}
                        {resource.isPremium && (
                          <Star className="w-4 h-4 text-yellow-500 ml-2" fill="currentColor" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{resource.type}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Popularity Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Popularity</span>
                    <span>{resource.popularity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                      style={{ width: `${resource.popularity}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {resource.previewContent && (
                    <button
                      onClick={() => handlePreview(resource.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isPreviewOpen ? "Hide" : "Preview"}</span>
                    </button>
                  )}
                  {resource.category === "link" ? (
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>

                {/* Preview Content */}
                {isPreviewOpen && resource.previewContent && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {resource.previewContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-sm text-gray-600">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {/* Pro Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How to Use These Resources</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Customize templates to match your experience and the job requirements</li>
              <li>• Use checklists to ensure you don't miss any important preparation steps</li>
              <li>• Study guides thoroughly and practice the techniques</li>
              <li>• Bookmark external resources for quick reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
