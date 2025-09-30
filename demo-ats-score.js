#!/usr/bin/env node

/**
 * ATS Score Generator Demo Script
 *
 * This script demonstrates the ATS Score Generator functionality
 * by sending sample data to the API and displaying results.
 */

import axios from "axios";

const API_BASE = "http://localhost:3001/api";

// Sample resume text
const sampleResume = `
John Doe
Senior Software Engineer

SUMMARY
Experienced full-stack developer with 5+ years of experience in JavaScript, React, Node.js, and cloud technologies. Proven track record of building scalable web applications and leading development teams.

SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Flask
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jest, Webpack

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Improved application performance by 40% through optimization
• Mentored 3 junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer | StartupXYZ | 2019 - 2021
• Developed responsive web applications using React and Node.js
• Built RESTful APIs handling 10K+ requests per minute
• Collaborated with product team to deliver features on time
• Wrote comprehensive unit tests achieving 90% code coverage

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019

CERTIFICATIONS
• AWS Certified Solutions Architect
• Google Cloud Professional Developer
`;

// Sample job description
const sampleJobDescription = `
Senior Full Stack Developer - TechCompany Inc.

We are seeking a Senior Full Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining our web applications using modern technologies.

REQUIREMENTS
• Must have 4+ years of experience in full-stack development
• Required: JavaScript, TypeScript, React, Node.js
• Experience with cloud platforms (AWS preferred)
• Strong knowledge of databases (PostgreSQL, MongoDB)
• Experience with microservices architecture
• Proficiency in Git and CI/CD practices

RESPONSIBILITIES
• Design and develop scalable web applications
• Collaborate with cross-functional teams
• Mentor junior developers
• Participate in code reviews and technical discussions
• Optimize application performance and scalability

NICE TO HAVE
• Experience with Docker and Kubernetes
• Knowledge of GraphQL
• Previous startup experience
• Open source contributions

BENEFITS
• Competitive salary and equity
• Health, dental, and vision insurance
• Flexible work arrangements
• Professional development budget
`;

async function checkHealth() {
  try {
    console.log("🔍 Checking API health...");
    const response = await axios.get(`${API_BASE}/health`);
    console.log("✅ API is healthy:", response.data.data.status);
    return true;
  } catch (error) {
    console.error("❌ API health check failed:", error.message);
    console.log("💡 Make sure the backend server is running on port 3001");
    console.log("   Run: cd server && npm run dev");
    return false;
  }
}

async function parseResume() {
  try {
    console.log("\n📄 Parsing resume...");
    const response = await axios.post(`${API_BASE}/parse/resume-text`, {
      text: sampleResume,
    });

    const { sections, metadata } = response.data.data;
    console.log("✅ Resume parsed successfully");
    console.log(
      `   📊 ${metadata.wordCount} words, ${sections.skills.length} skills found`
    );
    console.log(
      `   🎯 Skills: ${sections.skills.slice(0, 5).join(", ")}${
        sections.skills.length > 5 ? "..." : ""
      }`
    );

    return response.data.data;
  } catch (error) {
    console.error(
      "❌ Resume parsing failed:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function parseJobDescription() {
  try {
    console.log("\n📋 Parsing job description...");
    const response = await axios.post(`${API_BASE}/parse/job-description`, {
      text: sampleJobDescription,
    });

    const { requirements, skillsRequired, experienceYears } =
      response.data.data;
    console.log("✅ Job description parsed successfully");
    console.log(
      `   📋 ${requirements.length} requirements, ${skillsRequired.length} skills required`
    );
    console.log(`   ⏱️ ${experienceYears} years experience required`);
    console.log(
      `   🎯 Required skills: ${skillsRequired.slice(0, 5).join(", ")}${
        skillsRequired.length > 5 ? "..." : ""
      }`
    );

    return response.data.data;
  } catch (error) {
    console.error(
      "❌ Job description parsing failed:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function generateScore() {
  try {
    console.log("\n🎯 Generating ATS score...");
    const response = await axios.post(`${API_BASE}/score`, {
      resume: { text: sampleResume },
      jobDescription: { text: sampleJobDescription },
      includeDebug: true,
    });

    const { overall, sections, gates, missingKeywords, suggestions } =
      response.data.data;

    console.log("✅ ATS Score generated successfully");
    console.log("\n📊 SCORE BREAKDOWN:");
    console.log(`   🎯 Overall Score: ${overall}/100`);
    console.log(`   💼 Skills: ${sections.skills}%`);
    console.log(`   📈 Experience: ${sections.experience}%`);
    console.log(`   🎓 Education: ${sections.education}%`);
    console.log(`   🔤 Keywords: ${sections.keywords}%`);

    // Requirements check
    console.log("\n🚪 REQUIREMENTS CHECK:");
    gates.forEach((gate) => {
      const status = gate.passed ? "✅" : "❌";
      console.log(`   ${status} ${gate.rule}`);
      if (!gate.passed && gate.impact) {
        console.log(`      ⚠️ ${gate.impact}`);
      }
    });

    // Missing keywords
    if (missingKeywords.length > 0) {
      console.log("\n🔍 MISSING KEYWORDS:");
      missingKeywords.slice(0, 5).forEach((keyword) => {
        console.log(`   • ${keyword}`);
      });
      if (missingKeywords.length > 5) {
        console.log(`   ... and ${missingKeywords.length - 5} more`);
      }
    }

    // Top suggestions
    console.log("\n💡 TOP IMPROVEMENT SUGGESTIONS:");
    suggestions.topActions.slice(0, 3).forEach((action) => {
      console.log(`   • ${action}`);
    });

    // Sample bullet points
    if (suggestions.bullets.length > 0) {
      console.log("\n📝 SUGGESTED BULLET POINTS:");
      suggestions.bullets.slice(0, 2).forEach((bullet) => {
        console.log(`   ${bullet}`);
      });
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "❌ Score generation failed:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function getSupportedFormats() {
  try {
    console.log("\n📁 Getting supported file formats...");
    const response = await axios.get(`${API_BASE}/parse/supported-formats`);

    const { formats, maxFileSizeMB } = response.data.data;
    console.log("✅ Supported formats:");
    formats.forEach((format) => {
      console.log(
        `   • ${format.type} (${format.extensions.join(", ")}) - ${
          format.description
        }`
      );
    });
    console.log(`   📏 Maximum file size: ${maxFileSizeMB}MB`);

    return response.data.data;
  } catch (error) {
    console.error(
      "❌ Failed to get supported formats:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function runDemo() {
  console.log("🚀 ATS Score Generator Demo");
  console.log("================================\n");

  // Check if API is running
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    process.exit(1);
  }

  // Get supported formats
  await getSupportedFormats();

  // Parse resume
  const resumeData = await parseResume();
  if (!resumeData) {
    process.exit(1);
  }

  // Parse job description
  const jobDescData = await parseJobDescription();
  if (!jobDescData) {
    process.exit(1);
  }

  // Generate score
  const scoreData = await generateScore();
  if (!scoreData) {
    process.exit(1);
  }

  console.log("\n🎉 Demo completed successfully!");
  console.log("\n💡 Next steps:");
  console.log("   1. Open http://localhost:5173 in your browser");
  console.log("   2. Navigate to Interview Prep → ATS Score");
  console.log("   3. Upload your own resume and job description");
  console.log("   4. Generate your personalized ATS score!");

  if (scoreData.scoreRunId) {
    console.log(`\n📄 Score run saved with ID: ${scoreData.scoreRunId}`);
    console.log("   You can download the PDF report from the UI");
  }
}

// Run the demo
runDemo().catch((error) => {
  console.error("❌ Demo failed:", error.message);
  process.exit(1);
});
