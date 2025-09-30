import { db, seedDefaultConfig } from "../services/database.js";

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed default configuration
    await seedDefaultConfig();

    // Create a test user for development
    if (process.env.NODE_ENV === "development") {
      const testUser = await db.user.upsert({
        where: { email: "test@example.com" },
        update: {},
        create: {
          email: "test@example.com",
        },
      });

      console.log("✅ Test user created:", testUser.email);

      // Create sample resume
      const sampleResume = await db.resume.upsert({
        where: { id: "sample-resume-1" },
        update: {},
        create: {
          id: "sample-resume-1",
          userId: testUser.id,
          title: "Sample Software Engineer Resume",
          originalName: "john_doe_resume.pdf",
          text: `John Doe
Software Engineer

SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development using JavaScript, React, Node.js, and Python. Proven track record of delivering scalable web applications and leading cross-functional teams.

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
• Google Cloud Professional Developer`,
          parsedJson: JSON.stringify({
            summary:
              "Experienced software engineer with 5+ years of experience...",
            skills: [
              "JavaScript",
              "TypeScript",
              "Python",
              "React",
              "Node.js",
              "AWS",
            ],
            experience: [
              "Senior Software Engineer at TechCorp Inc.",
              "Software Engineer at StartupXYZ",
            ],
            education: ["Bachelor of Science in Computer Science"],
            certifications: [
              "AWS Certified Solutions Architect",
              "Google Cloud Professional Developer",
            ],
          }),
        },
      });

      // Create sample job description
      const sampleJobDesc = await db.jobDesc.upsert({
        where: { id: "sample-jd-1" },
        update: {},
        create: {
          id: "sample-jd-1",
          userId: testUser.id,
          title: "Senior Full Stack Developer",
          source: "TechCompany Inc.",
          text: `Senior Full Stack Developer - TechCompany Inc.

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
• Professional development budget`,
          parsedJson: JSON.stringify({
            hardRequirements: [
              "4+ years of experience in full-stack development",
              "JavaScript, TypeScript, React, Node.js",
            ],
            skillsRequired: [
              "JavaScript",
              "TypeScript",
              "React",
              "Node.js",
              "AWS",
              "PostgreSQL",
              "MongoDB",
            ],
            niceToHave: ["Docker", "Kubernetes", "GraphQL"],
            experienceYears: 4,
          }),
        },
      });

      // Create sample score run
      await db.scoreRun.upsert({
        where: { id: "sample-score-1" },
        update: {},
        create: {
          id: "sample-score-1",
          userId: testUser.id,
          resumeId: sampleResume.id,
          jobDescId: sampleJobDesc.id,
          overall: 85,
          sectionJson: JSON.stringify({
            skills: 90,
            experience: 85,
            education: 80,
            keywords: 75,
          }),
          gapsJson: JSON.stringify({
            missingKeywords: ["GraphQL", "Docker"],
            gates: [
              {
                rule: "Must have 4+ years experience",
                passed: true,
                details: "Candidate has 5+ years experience",
              },
            ],
          }),
          suggestionsJson: JSON.stringify({
            bullets: [
              "• Architected microservices infrastructure using Docker and Kubernetes, improving deployment efficiency by 50%",
              "• Implemented GraphQL APIs that reduced data transfer by 30% and improved frontend performance",
            ],
            topActions: [
              "Add Docker and Kubernetes experience to skills section",
              "Include GraphQL projects in experience",
              "Quantify more achievements with specific metrics",
            ],
          }),
          modelVersion: "1.0",
        },
      });

      console.log("✅ Sample data created");
    }

    console.log("🌱 Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
