import { Question } from "../InterviewSubjects";

// Collection of Behavioral interview questions
export const behavioralQuestions: Question[] = [
  {
    id: "beh-1",
    question:
      "Tell me about a time you faced a significant challenge at work and how you overcame it.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "At my previous role, I was assigned to lead a project with a tight deadline that had already been pushed back twice. The team was demotivated, and stakeholders were losing confidence. First, I met individually with team members to understand their challenges and gather insights. I identified that the scope was too large and resources were stretched thin. I then restructured the project using an agile approach, breaking it into smaller, achievable sprints. I negotiated with stakeholders to prioritize features based on business impact, reducing the initial scope by 30%. I implemented daily stand-ups to improve communication and quickly address roadblocks. Additionally, I secured temporary help from another team to assist with specific technical challenges. Through these changes, we successfully delivered the core functionality on time, gradually added remaining features in subsequent releases, and restored stakeholder confidence. The approach was so successful that it became a template for future projects with similar challenges.",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Show specific actions you took",
      "Quantify your results if possible",
      "Include what you learned from the experience",
    ],
    tags: ["leadership", "problem-solving", "resilience", "behavioral"],
    estimatedTime: 3,
    industry: ["all"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-2",
    question:
      "Describe a situation where you had to work with a difficult team member or colleague.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "In my role as a project manager, I worked with a senior developer who was technically brilliant but often communicated harshly with others and missed deadlines without notice. Rather than escalating immediately, I invited them to coffee to build rapport and understand their perspective. I discovered they were overwhelmed with tasks and felt their expertise wasn't being properly utilized. Taking this insight, I first acknowledged their technical contributions publicly in team meetings. Then, I worked with them to establish a communication system where they could signal when they were falling behind without feeling judged. I also restructured some assignments to better leverage their expertise in architecture rather than routine coding tasks. For communication issues, I gave specific, private feedback about how their tone affected others, using concrete examples. Over three months, their deadline compliance improved by 70%, and team conflicts decreased significantly. The experience taught me that difficult behavior often stems from unaddressed needs or frustrations, and taking a personalized approach to address the underlying issues can turn a challenging relationship into a productive one.",
    tips: [
      "Focus on how you handled the situation, not the other person",
      "Avoid negative characterizations of the colleague",
      "Highlight positive resolution and what you learned",
      "Show empathy and professional communication",
    ],
    tags: ["conflict-resolution", "communication", "teamwork", "behavioral"],
    estimatedTime: 3,
    industry: ["all"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-3",
    question: "Tell me about a time you made a mistake and how you handled it.",
    category: "behavioral",
    difficulty: "hard",
    type: "behavioral",
    sampleAnswer:
      "While managing a software release, I made a significant error by not thoroughly testing a critical integration point, assuming it was covered by another team. This resulted in a production issue affecting approximately 500 customers shortly after deployment. Immediately upon discovering the issue, I took responsibility and informed my manager. Rather than looking for excuses, I focused on solutions. I assembled a cross-functional team to implement an urgent fix while our customer service team communicated transparently with affected users. We resolved the issue within four hours, minimizing impact. Afterward, I conducted a thorough root cause analysis and presented it to the team, outlining what went wrong and taking ownership of my mistake. I implemented new processes requiring explicit verification of all integration points and created a comprehensive pre-release checklist that has since been adopted across the organization. I also scheduled follow-up calls with key affected customers to rebuild trust. This experience taught me the importance of never making assumptions in critical processes, regardless of experience level, and that transparency about mistakes ultimately builds stronger relationships with both teams and customers.",
    tips: [
      "Be honest about the mistake",
      "Focus more on the resolution than the mistake itself",
      "Explain what you learned",
      "Describe process improvements you implemented",
    ],
    tags: ["accountability", "problem-solving", "resilience", "behavioral"],
    estimatedTime: 3,
    industry: ["all"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-4",
    question:
      "Give an example of a time you had to influence others without having formal authority.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "As a software engineer, I identified a critical security vulnerability in our authentication system that needed immediate attention, but it wasn't on the current sprint roadmap and I had no formal authority to change priorities. Instead of simply raising an alarm, I prepared thoroughly by documenting the issue with proof-of-concept examples, researching industry standards for similar vulnerabilities, and outlining three potential solutions with different implementation timelines and trade-offs. I scheduled individual conversations with key stakeholders before presenting at the team meeting, addressing their specific concerns preemptively. During the presentation, I focused on business impact rather than technical details, explaining potential costs of a breach versus the relatively small investment needed for the fix. I also volunteered to lead the implementation without disrupting other team members' current priorities. By building consensus through preparation, data-driven arguments, and offering solutions rather than just identifying problems, I successfully convinced the team and product owner to prioritize this work. We implemented the fix within two weeks, and the approach was later commended during our security audit. This experience taught me that influence comes from credibility, preparation, and focusing on mutual benefits rather than positional authority.",
    tips: [
      "Focus on how you built consensus",
      "Explain your reasoning and approach",
      "Highlight communication strategies",
      "Show the positive outcome",
    ],
    tags: ["influence", "leadership", "communication", "behavioral"],
    estimatedTime: 3,
    industry: ["all"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-5",
    question:
      "Describe a situation where you had to adapt to significant change at work.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "At my previous company, our team of 15 was suddenly informed that we would be transitioning from a waterfall methodology to agile/scrum within just one month, while still maintaining all delivery deadlines. As the technical lead, I recognized that while the change was necessary for long-term success, the short timeline created significant anxiety among team members. I took initiative by organizing a voluntary weekend workshop where I brought in an experienced scrum master friend who provided training. I created a transition plan with incremental changes rather than an abrupt switch, starting with daily stand-ups and a basic backlog while gradually introducing sprints and other ceremonies. I identified two team members who were particularly enthusiastic about agile and designated them as internal champions to help support others. Throughout the transition, I maintained a feedback loop with management to adjust timelines when necessary and created a 'translation guide' that mapped familiar waterfall concepts to their agile counterparts. Despite initial resistance, we successfully completed our first two-week sprint cycle within five weeks of the announcement, with only a 10% initial productivity dip that quickly recovered. Six months later, our team velocity had increased by 30% compared to our previous methodology. This experience taught me that managing change requires empathy, incremental steps, and creating a supportive environment where people feel equipped to adapt rather than overwhelmed.",
    tips: [
      "Show a positive attitude toward change",
      "Explain specific strategies you used to adapt",
      "Highlight any leadership you demonstrated",
      "Describe the successful outcome",
    ],
    tags: ["adaptability", "change-management", "resilience", "behavioral"],
    estimatedTime: 3,
    industry: ["all"],
    practiceCount: 0,
    successRate: 0,
  },
];
