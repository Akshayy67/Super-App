import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InterviewPerformanceData } from './performanceAnalytics';

export interface PDFExportOptions {
  includeCharts: boolean;
  includeRoadmap: boolean;
  includeDetailedScores: boolean;
  includeRecommendations: boolean;
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export class PDFExportService {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 20;

  constructor(options: PDFExportOptions) {
    this.pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.format,
    });
    
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
  }

  async generatePerformanceReport(
    performanceData: InterviewPerformanceData,
    options: PDFExportOptions
  ): Promise<Blob> {
    // Add header
    this.addHeader();
    
    // Add performance summary
    this.addPerformanceSummary(performanceData);
    
    if (options.includeDetailedScores) {
      this.addDetailedScores(performanceData);
    }
    
    if (options.includeRecommendations) {
      this.addRecommendations(performanceData);
    }
    
    if (options.includeCharts) {
      await this.addCharts();
    }
    
    if (options.includeRoadmap) {
      this.addImprovementRoadmap(performanceData);
    }
    
    // Add footer
    this.addFooter();
    
    return this.pdf.output('blob');
  }

  private addHeader(): void {
    // Logo and title
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Interview Performance Report', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Date and metadata
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    
    this.currentY += 10;
    
    // Add separator line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addPerformanceSummary(performanceData: InterviewPerformanceData): void {
    this.checkPageBreak(60);
    
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Performance Summary', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Overall score with visual indicator
    this.addScoreCard('Overall Score', performanceData.overallScore, 100);
    this.addScoreCard('Technical Skills', performanceData.technicalScore, 100);
    this.addScoreCard('Communication', performanceData.communicationScore, 100);
    this.addScoreCard('Behavioral', performanceData.behavioralScore, 100);
    
    this.currentY += 10;
    
    // Interview metadata
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Role: ${performanceData.role}`, this.margin, this.currentY);
    this.currentY += 6;
    this.pdf.text(`Difficulty: ${performanceData.difficulty}`, this.margin, this.currentY);
    this.currentY += 6;
    this.pdf.text(`Duration: ${Math.round(performanceData.duration / 60)} minutes`, this.margin, this.currentY);
    this.currentY += 6;
    this.pdf.text(`Questions Answered: ${performanceData.questionsAnswered}`, this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addScoreCard(label: string, score: number, maxScore: number): void {
    const cardHeight = 20;
    const cardWidth = 40;
    const startX = this.margin;
    
    // Background rectangle
    this.pdf.setFillColor(this.getScoreColor(score, maxScore));
    this.pdf.rect(startX, this.currentY, cardWidth, cardHeight, 'F');
    
    // Border
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.rect(startX, this.currentY, cardWidth, cardHeight);
    
    // Label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, startX + 2, this.currentY + 6);
    
    // Score
    this.pdf.setFontSize(14);
    this.pdf.text(`${score}/${maxScore}`, startX + 2, this.currentY + 15);
    
    // Progress bar
    const progressWidth = (score / maxScore) * (cardWidth - 4);
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(startX + 2, this.currentY + 17, cardWidth - 4, 2, 'F');
    this.pdf.setFillColor(0, 100, 0);
    this.pdf.rect(startX + 2, this.currentY + 17, progressWidth, 2, 'F');
    
    this.currentY += cardHeight + 5;
  }

  private addDetailedScores(performanceData: InterviewPerformanceData): void {
    this.checkPageBreak(80);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Detailed Analysis', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Speech Analysis
    this.addSection('Speech Analysis', [
      `Clarity: ${performanceData.speechAnalysis.pronunciationAssessment.clarity}%`,
      `Pace: ${performanceData.speechAnalysis.paceAnalysis.wordsPerMinute} WPM`,
      `Confidence: ${performanceData.speechAnalysis.confidenceScore.overall}%`,
      `Filler Words: ${performanceData.speechAnalysis.fillerWords.percentage.toFixed(1)}%`,
    ]);
    
    // Body Language Analysis
    this.addSection('Body Language Analysis', [
      `Eye Contact: ${performanceData.bodyLanguageAnalysis.eyeContact.percentage}%`,
      `Posture Score: ${performanceData.bodyLanguageAnalysis.posture.score}/100`,
      `Professionalism: ${performanceData.bodyLanguageAnalysis.overallBodyLanguage.professionalismScore}/100`,
    ]);
    
    // Detailed Metrics
    this.addSection('Performance Metrics', [
      `Confidence: ${performanceData.detailedMetrics.confidence}%`,
      `Clarity: ${performanceData.detailedMetrics.clarity}%`,
      `Professionalism: ${performanceData.detailedMetrics.professionalism}%`,
      `Engagement: ${performanceData.detailedMetrics.engagement}%`,
      `Adaptability: ${performanceData.detailedMetrics.adaptability}%`,
    ]);
  }

  private addSection(title: string, items: string[]): void {
    this.checkPageBreak(30 + items.length * 6);
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    
    this.currentY += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    
    items.forEach(item => {
      this.pdf.text(`• ${item}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 5;
  }

  private addRecommendations(performanceData: InterviewPerformanceData): void {
    this.checkPageBreak(60);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Recommendations', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Strengths
    if (performanceData.strengths.length > 0) {
      this.addSection('Strengths', performanceData.strengths);
    }
    
    // Areas for Improvement
    if (performanceData.weaknesses.length > 0) {
      this.addSection('Areas for Improvement', performanceData.weaknesses);
    }
    
    // Action Items
    if (performanceData.recommendations.length > 0) {
      this.addSection('Recommended Actions', performanceData.recommendations);
    }
  }

  private async addCharts(): Promise<void> {
    // This would capture chart elements from the DOM and add them to PDF
    // For now, we'll add a placeholder
    this.checkPageBreak(100);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Performance Charts', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Add placeholder for charts
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('Performance trend charts would appear here', 
      this.pageWidth / 2, this.currentY + 40, { align: 'center' });
    
    this.currentY += 90;
  }

  private addImprovementRoadmap(performanceData: InterviewPerformanceData): void {
    this.checkPageBreak(80);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('90-Day Improvement Roadmap', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Generate roadmap items based on weak areas
    const roadmapItems = this.generateRoadmapItems(performanceData);
    
    roadmapItems.forEach((item, index) => {
      this.checkPageBreak(25);
      
      // Milestone number
      this.pdf.setFillColor(70, 130, 180);
      this.pdf.circle(this.margin + 5, this.currentY + 3, 3, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.text(`${index + 1}`, this.margin + 5, this.currentY + 4, { align: 'center' });
      
      // Milestone details
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(item.title, this.margin + 15, this.currentY + 4);
      
      this.currentY += 8;
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(item.description, this.margin + 15, this.currentY);
      
      this.currentY += 6;
      
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(`Target: ${item.target} | Timeline: ${item.timeline}`, this.margin + 15, this.currentY);
      
      this.currentY += 10;
      this.pdf.setTextColor(0, 0, 0);
    });
  }

  private generateRoadmapItems(performanceData: InterviewPerformanceData) {
    const items = [];
    
    if (performanceData.communicationScore < 80) {
      items.push({
        title: 'Improve Communication Skills',
        description: 'Focus on clarity, pace, and confidence in verbal communication',
        target: '85+ score',
        timeline: '30 days'
      });
    }
    
    if (performanceData.technicalScore < 80) {
      items.push({
        title: 'Enhance Technical Knowledge',
        description: 'Practice coding problems and system design concepts',
        target: '85+ score',
        timeline: '60 days'
      });
    }
    
    if (performanceData.behavioralScore < 80) {
      items.push({
        title: 'Strengthen Behavioral Responses',
        description: 'Develop compelling stories using STAR method',
        target: '85+ score',
        timeline: '45 days'
      });
    }
    
    return items;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    
    this.pdf.text('Generated by AI Interview System', this.margin, footerY);
    this.pdf.text(`Page ${this.pdf.getNumberOfPages()}`, 
      this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.pdf.addPage();
      this.currentY = 20;
    }
  }

  private getScoreColor(score: number, maxScore: number): number[] {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return [144, 238, 144]; // Light green
    if (percentage >= 60) return [255, 255, 224]; // Light yellow
    return [255, 182, 193]; // Light red
  }
}

// Utility function to export performance data
export const exportPerformanceReport = async (
  performanceData: InterviewPerformanceData,
  options: PDFExportOptions = {
    includeCharts: true,
    includeRoadmap: true,
    includeDetailedScores: true,
    includeRecommendations: true,
    format: 'A4',
    orientation: 'portrait',
  }
): Promise<void> => {
  const exportService = new PDFExportService(options);
  const pdfBlob = await exportService.generatePerformanceReport(performanceData, options);
  
  // Create download link
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `interview-report-${performanceData.timestamp.split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
