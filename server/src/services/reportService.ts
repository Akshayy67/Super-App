import puppeteer from "puppeteer";

export interface ReportData {
  id: string;
  overall: number;
  sections: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  gaps: {
    missingKeywords: string[];
    gates: Array<{
      rule: string;
      passed: boolean;
      details: string;
      impact?: string;
    }>;
  };
  suggestions: {
    bullets: string[];
    topActions: string[];
  };
  modelVersion: string;
  createdAt: Date;
  resume: {
    title: string;
    originalName: string;
  };
  jobDescription: {
    title: string;
    source?: string;
  };
  user?: {
    email: string;
  } | null;
}

export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  let browser: puppeteer.Browser | null = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set page size to A4
    await page.setViewport({ width: 794, height: 1123 }); // A4 in pixels at 96 DPI

    // Generate HTML content
    const htmlContent = generateReportHTML(data);

    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(
      `Failed to generate PDF report: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateReportHTML(data: ReportData): string {
  const { overall, sections, gaps, suggestions, resume, jobDescription } = data;

  // Determine overall score color and grade
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "#10B981"; // Green
    if (score >= 70) return "#F59E0B"; // Yellow
    if (score >= 50) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ATS Score Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #E5E7EB;
        }
        
        .header h1 {
          color: #1F2937;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header .subtitle {
          color: #6B7280;
          font-size: 14px;
        }
        
        .score-overview {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
        }
        
        .score-card {
          flex: 1;
          text-align: center;
          padding: 20px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #F9FAFB;
        }
        
        .overall-score {
          font-size: 48px;
          font-weight: bold;
          color: ${getScoreColor(overall)};
          margin-bottom: 5px;
        }
        
        .score-grade {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 10px;
        }
        
        .section-scores {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .section-score {
          padding: 15px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: white;
        }
        
        .section-score h3 {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-score .score {
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section h2 {
          font-size: 18px;
          color: #1F2937;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .missing-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .keyword-tag {
          background: #FEF3C7;
          color: #92400E;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .suggestions ul {
          list-style: none;
          padding-left: 0;
        }
        
        .suggestions li {
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .suggestions li:before {
          content: "•";
          color: #10B981;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .gates {
          margin-bottom: 20px;
        }
        
        .gate {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 6px;
          background: #F9FAFB;
        }
        
        .gate-status {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .gate-passed {
          background: #10B981;
        }
        
        .gate-failed {
          background: #EF4444;
        }
        
        .gate-text {
          font-size: 14px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
        }
        
        .meta-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .meta-card {
          padding: 15px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: #F9FAFB;
        }
        
        .meta-card h3 {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .meta-card p {
          font-size: 14px;
          color: #1F2937;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ATS Score Report</h1>
        <div class="subtitle">
          Generated on ${new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div class="meta-info">
        <div class="meta-card">
          <h3>Resume</h3>
          <p><strong>Title:</strong> ${resume.title}</p>
          <p><strong>File:</strong> ${resume.originalName}</p>
        </div>
        <div class="meta-card">
          <h3>Job Description</h3>
          <p><strong>Title:</strong> ${jobDescription.title}</p>
          ${
            jobDescription.source
              ? `<p><strong>Company:</strong> ${jobDescription.source}</p>`
              : ""
          }
        </div>
      </div>

      <div class="score-overview">
        <div class="score-card">
          <div class="overall-score">${overall}</div>
          <div class="score-grade">${getScoreGrade(overall)}</div>
          <div style="font-size: 12px; color: #6B7280;">Overall ATS Score</div>
        </div>
      </div>

      <div class="section-scores">
        <div class="section-score">
          <h3>Skills Match</h3>
          <div class="score">${sections.skills}%</div>
        </div>
        <div class="section-score">
          <h3>Experience</h3>
          <div class="score">${sections.experience}%</div>
        </div>
        <div class="section-score">
          <h3>Education</h3>
          <div class="score">${sections.education}%</div>
        </div>
        <div class="section-score">
          <h3>Keywords</h3>
          <div class="score">${sections.keywords}%</div>
        </div>
      </div>

      ${
        gaps.gates.length > 0
          ? `
        <div class="section">
          <h2>Requirements Check</h2>
          <div class="gates">
            ${gaps.gates
              .map(
                (gate) => `
              <div class="gate">
                <div class="gate-status ${
                  gate.passed ? "gate-passed" : "gate-failed"
                }"></div>
                <div class="gate-text">
                  <strong>${gate.rule}</strong><br>
                  <span style="font-size: 12px; color: #6B7280;">${
                    gate.details
                  }</span>
                  ${
                    gate.impact
                      ? `<br><span style="font-size: 12px; color: #EF4444;">${gate.impact}</span>`
                      : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      ${
        gaps.missingKeywords.length > 0
          ? `
        <div class="section">
          <h2>Missing Keywords</h2>
          <div class="missing-keywords">
            ${gaps.missingKeywords
              .map(
                (keyword) => `
              <span class="keyword-tag">${keyword}</span>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <div class="section">
        <h2>Improvement Suggestions</h2>
        <div class="suggestions">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #1F2937;">Top Actions</h3>
          <ul>
            ${suggestions.topActions
              .map((action) => `<li>${action}</li>`)
              .join("")}
          </ul>
          
          ${
            suggestions.bullets.length > 0
              ? `
            <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #1F2937;">Suggested Bullet Points</h3>
            <ul>
              ${suggestions.bullets
                .map((bullet) => `<li>${bullet}</li>`)
                .join("")}
            </ul>
          `
              : ""
          }
        </div>
      </div>

      <div class="footer">
        <p>Report ID: ${data.id} | Model Version: ${data.modelVersion}</p>
        <p>Generated by ATS Score Generator | This report is confidential and intended for the recipient only.</p>
      </div>
    </body>
    </html>
  `;
}
