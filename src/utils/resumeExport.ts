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

    for (const section of sortedSections) {
      // Check if we need a new page
      if (yPosition > pageHeight - margins.bottom - 30) {
        pdf.addPage();
        yPosition = margins.top;
      }

      // Render section based on type
      switch (section.type) {
        case "header":
          yPosition = this.renderHeader(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        case "summary":
          yPosition = this.renderSummary(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        case "experience":
          yPosition = this.renderExperience(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        case "education":
          yPosition = this.renderEducation(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        case "skills":
          yPosition = this.renderSkills(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        case "projects":
          yPosition = this.renderProjects(pdf, section.content, margins.left, yPosition, contentWidth);
          break;
        default:
          yPosition = this.renderGenericSection(pdf, section, margins.left, yPosition, contentWidth);
      }

      yPosition += 10; // Spacing between sections
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
    width: number
  ): number {
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(content.fullName || "", x, y, { maxWidth: width });
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      content.email,
      content.phone,
      content.location,
    ].filter(Boolean).join(" | ");
    pdf.text(contactInfo, x, y, { maxWidth: width });
    y += 5;

    if (content.linkedin || content.github || content.portfolio) {
      const links = [
        content.linkedin ? `LinkedIn: ${content.linkedin}` : "",
        content.github ? `GitHub: ${content.github}` : "",
        content.portfolio ? `Portfolio: ${content.portfolio}` : "",
      ].filter(Boolean).join(" | ");
      pdf.text(links, x, y, { maxWidth: width });
      y += 5;
    }

    return y;
  }

  private static renderSummary(
    pdf: jsPDF,
    content: string,
    x: number,
    y: number,
    width: number
  ): number {
    if (!content) return y;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Professional Summary", x, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(content, width);
    pdf.text(lines, x, y);
    y += lines.length * 5;

    return y;
  }

  private static renderExperience(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Work Experience", x, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const exp of content) {
      // Check page break
      if (y > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        y = 20;
      }

      // Job title and company
      pdf.setFont("helvetica", "bold");
      pdf.text(exp.jobTitle || "", x, y);
      const companyText = `${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}`;
      pdf.setFont("helvetica", "normal");
      pdf.text(companyText, x + 60, y);
      y += 5;

      // Date range
      const dateRange = `${exp.startDate || ""} - ${exp.endDate || ""}`;
      pdf.setFontSize(9);
      pdf.text(dateRange, x, y);
      y += 5;

      // Description
      if (exp.description) {
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(exp.description, width);
        pdf.text(descLines, x, y);
        y += descLines.length * 5;
      }

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        pdf.setFontSize(9);
        for (const achievement of exp.achievements) {
          pdf.text(`• ${achievement}`, x + 5, y, { maxWidth: width - 5 });
          y += 5;
        }
      }

      y += 5; // Spacing between experiences
    }

    return y;
  }

  private static renderEducation(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Education", x, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const edu of content) {
      pdf.setFont("helvetica", "bold");
      pdf.text(edu.degree || "", x, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(edu.institution || "", x + 60, y);
      y += 5;

      if (edu.location) {
        pdf.setFontSize(9);
        pdf.text(edu.location, x, y);
        y += 5;
      }

      const dateRange = `${edu.startDate || ""} - ${edu.endDate || ""}`;
      pdf.text(dateRange, x, y);
      y += 5;

      if (edu.gpa) {
        pdf.text(`GPA: ${edu.gpa}`, x, y);
        y += 5;
      }

      y += 3;
    }

    return y;
  }

  private static renderSkills(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Skills", x, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const skillsText = content.map((s: any) => s.name).join(", ");
    const lines = pdf.splitTextToSize(skillsText, width);
    pdf.text(lines, x, y);
    y += lines.length * 5;

    return y;
  }

  private static renderProjects(
    pdf: jsPDF,
    content: any[],
    x: number,
    y: number,
    width: number
  ): number {
    if (!Array.isArray(content) || content.length === 0) return y;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Projects", x, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const proj of content) {
      pdf.setFont("helvetica", "bold");
      pdf.text(proj.name || "", x, y);
      y += 5;

      if (proj.description) {
        pdf.setFont("helvetica", "normal");
        const descLines = pdf.splitTextToSize(proj.description, width);
        pdf.text(descLines, x, y);
        y += descLines.length * 5;
      }

      if (proj.technologies && proj.technologies.length > 0) {
        pdf.setFontSize(9);
        pdf.text(`Technologies: ${proj.technologies.join(", ")}`, x, y);
        y += 5;
      }

      y += 5;
    }

    return y;
  }

  private static renderGenericSection(
    pdf: jsPDF,
    section: any,
    x: number,
    y: number,
    width: number
  ): number {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(section.title, x, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const content = JSON.stringify(section.content);
    const lines = pdf.splitTextToSize(content, width);
    pdf.text(lines, x, y);
    y += lines.length * 5;

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

