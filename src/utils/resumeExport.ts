// Resume Export Utilities (PDF, DOCX, JSON)
import jsPDF from "jspdf";
import type { ResumeData, ExportOptions } from "../types/resumeBuilder";
import { getTemplateById } from "./resumeTemplates";

export class ResumeExport {
  /**
   * Export resume as PDF
   */
  static async exportToPDF(
    resumeData: ResumeData,
    options: ExportOptions = { format: "pdf" }
  ): Promise<Blob> {
    const template = getTemplateById(resumeData.template);
    const pageSize = options.pageSize || "A4";
    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pageSize,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margins.left - margins.right;
    let yPosition = margins.top;

    // Set font
    pdf.setFont("helvetica");
    pdf.setFontSize(resumeData.settings.fontSize || 11);

    // Render sections
    const sortedSections = [...resumeData.sections]
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < sortedSections.length; i++) {
      const section = sortedSections[i];
      const isLastSection = i === sortedSections.length - 1;

      // Check if we need a new page
      if (yPosition > pageHeight - margins.bottom - 30) {
        pdf.addPage();
        yPosition = margins.top;
      }

      // Render section based on type
      switch (section.type) {
        case "header":
          yPosition = this.renderHeader(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "summary":
          yPosition = this.renderSummary(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "experience":
          yPosition = this.renderExperience(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "education":
          yPosition = this.renderEducation(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "skills":
          yPosition = this.renderSkills(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "projects":
          yPosition = this.renderProjects(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "certifications":
          yPosition = this.renderCertifications(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        case "awards":
          yPosition = this.renderAwards(pdf, section.content, margins.left, yPosition, contentWidth, pageHeight, margins);
          break;
        default:
          yPosition = this.renderGenericSection(pdf, section, margins.left, yPosition, contentWidth, pageHeight, margins);
      }

      // Only add spacing if not the last section
      if (!isLastSection) {
        // Reduce spacing after header section
        if (section.type === "header") {
          yPosition += 2; // Minimal spacing after header
        } else {
          yPosition += 6; // Normal spacing between other sections
        }
      }
    }

    // Add page numbers if enabled
    if (resumeData.settings.showPageNumbers) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }
    }

    // Generate blob
    const pdfBlob = pdf.output("blob");
    return pdfBlob;
  }

  private static renderHeader(
    pdf: jsPDF,
    content: any,
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    // Center align header
    const centerX = x + width / 2;
    
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(content.fullName || "", centerX, y, { align: "center", maxWidth: width });
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      content.email,
      content.phone,
      content.location,
    ].filter(Boolean).join(" | ");
    pdf.text(contactInfo, centerX, y, { align: "center", maxWidth: width });
    y += 5;

    if (content.linkedin || content.github || content.portfolio) {
      const links = [
        content.linkedin ? `LinkedIn: ${content.linkedin}` : "",
        content.github ? `GitHub: ${content.github}` : "",
        content.portfolio ? `Portfolio: ${content.portfolio}` : "",
      ].filter(Boolean).join(" | ");
      pdf.setFontSize(9);
      pdf.text(links, centerX, y, { align: "center", maxWidth: width });
      y += 5;
    }

    // Add border line
    y += 3;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(x, y, x + width, y);
    y += 4; // Reduced spacing after header

    return y;
  }

  private static renderSummary(
    pdf: jsPDF,
    content: string,
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!content) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Professional Summary", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(content, width);
    pdf.text(lines, x, y);
    y += lines.length * 4.5;
    // No extra spacing - spacing handled by section loop

    return y;
  }

  private static renderExperience(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Work Experience", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const exp of content) {
      // Check page break
      if (y > pageHeight - margins.bottom - 40) {
        pdf.addPage();
        y = margins.top;
      }

      // Job title and company on same line
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(exp.jobTitle || "", x, y);
      
      // Date range on the right
      const dateRange = `${exp.startDate || ""} - ${exp.endDate || ""}`;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const dateWidth = pdf.getTextWidth(dateRange);
      pdf.text(dateRange, x + width - dateWidth, y);
      y += 5;

      // Company and location
      pdf.setFontSize(10);
      const companyText = `${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}`;
      pdf.text(companyText, x, y);
      y += 5;

      // Description
      if (exp.description) {
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(exp.description, width);
        pdf.text(descLines, x, y);
        y += descLines.length * 4.5;
      }

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        pdf.setFontSize(9);
        for (const achievement of exp.achievements) {
          const achievementLines = pdf.splitTextToSize(`• ${achievement}`, width - 5);
          pdf.text(achievementLines, x + 5, y);
          y += achievementLines.length * 4.5;
        }
      }

      // Technologies
      if (exp.technologies && exp.technologies.length > 0) {
        pdf.setFontSize(8);
        pdf.text(`Technologies: ${exp.technologies.join(", ")}`, x, y);
        y += 4;
      }

      y += 6; // Spacing between experiences
    }

    return y;
  }

  private static renderEducation(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Education", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const edu of content) {
      // Check page break
      if (y > pageHeight - margins.bottom - 30) {
        pdf.addPage();
        y = margins.top;
      }

      // Degree and date on same line
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(edu.degree || "", x, y);
      
      const dateRange = `${edu.startDate || ""} - ${edu.endDate || ""}`;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const dateWidth = pdf.getTextWidth(dateRange);
      pdf.text(dateRange, x + width - dateWidth, y);
      y += 5;

      // Institution
      pdf.setFontSize(10);
      pdf.text(edu.institution || "", x, y);
      y += 4;

      if (edu.location) {
        pdf.setFontSize(9);
        pdf.text(edu.location, x, y);
        y += 4;
      }

      // GPA or percentage
      if (edu.gpa) {
        pdf.setFontSize(9);
        pdf.text(`GPA: ${edu.gpa}`, x, y);
        y += 4;
      }

      y += 4; // Spacing between education entries
    }

    return y;
  }

  private static renderSkills(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Skills", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // Group skills by category if available
    const skillsByCategory: { [key: string]: string[] } = {};
    content.forEach((skill: any) => {
      const category = skill.category || "General";
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skill.name);
    });

    // Render skills
    Object.keys(skillsByCategory).forEach((category) => {
      if (y > pageHeight - margins.bottom - 20) {
        pdf.addPage();
        y = margins.top;
      }

      if (Object.keys(skillsByCategory).length > 1) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`${category}:`, x, y);
        y += 5;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const skillsText = skillsByCategory[category].join(", ");
      const lines = pdf.splitTextToSize(skillsText, width);
      pdf.text(lines, x, y);
      y += lines.length * 4.5;
      y += 3;
    });

    return y;
  }

  private static renderProjects(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Projects", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const proj of content) {
      // Check page break
      if (y > pageHeight - margins.bottom - 40) {
        pdf.addPage();
        y = margins.top;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(proj.name || "", x, y);
      y += 5;

      if (proj.description) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(proj.description, width);
        pdf.text(descLines, x, y);
        y += descLines.length * 4.5;
      }

      if (proj.technologies && proj.technologies.length > 0) {
        pdf.setFontSize(9);
        pdf.text(`Technologies: ${proj.technologies.join(", ")}`, x, y);
        y += 4;
      }

      y += 6; // Spacing between projects
    }

    return y;
  }

  private static renderCertifications(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Certifications", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const cert of content) {
      if (y > pageHeight - margins.bottom - 20) {
        pdf.addPage();
        y = margins.top;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(cert.name || "", x, y);
      y += 4;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const issuerText = cert.issuer || "";
      const dateText = cert.date ? ` • ${cert.date}` : "";
      pdf.text(`${issuerText}${dateText}`, x, y);
      y += 4;

      if (cert.credentialId) {
        pdf.setFontSize(8);
        pdf.text(`Credential ID: ${cert.credentialId}`, x, y);
        y += 4;
      }

      y += 3;
    }

    return y;
  }

  private static renderAwards(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Honors & Awards", x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const award of content) {
      if (y > pageHeight - margins.bottom - 30) {
        pdf.addPage();
        y = margins.top;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(award.title || "", x, y);
      y += 4;

      if (award.issuer) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const issuerText = award.issuer;
        const dateText = award.date ? ` • ${award.date}` : "";
        pdf.text(`${issuerText}${dateText}`, x, y);
        y += 4;
      }

      if (award.description) {
        pdf.setFontSize(9);
        const descLines = pdf.splitTextToSize(award.description, width);
        pdf.text(descLines, x, y);
        y += descLines.length * 4;
      }

      y += 3;
    }

    return y;
  }

  private static renderGenericSection(
    pdf: jsPDF,
    section: any,
    x: number,
    y: number,
    width: number,
    pageHeight: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): number {
    // Section header with border
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(section.title, x, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + width, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const content = JSON.stringify(section.content);
    const lines = pdf.splitTextToSize(content, width);
    pdf.text(lines, x, y);
    y += lines.length * 4.5;

    return y;
  }

  /**
   * Export resume as JSON
   */
  static exportToJSON(resumeData: ResumeData): Blob {
    const jsonString = JSON.stringify(resumeData, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Download file helper
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}


