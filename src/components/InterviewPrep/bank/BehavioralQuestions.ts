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
  {
    id: "beh-6",
    question:
      "Tell me about a time when you had to work with a difficult team member.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "I once worked with a colleague who was very resistant to feedback and often dismissed others' ideas. I approached this by first trying to understand their perspective through one-on-one conversations. I discovered they felt their expertise wasn't being recognized. I started acknowledging their contributions publicly and asking for their input on technical decisions. This helped build trust, and they became more collaborative. The key was addressing the underlying issue rather than just the symptoms.",
    approach:
      "Use the STAR method: Situation (difficult team member), Task (maintain team productivity), Action (understand their perspective, acknowledge contributions), Result (improved collaboration).",
    tips: [
      "Focus on your actions, not criticizing the other person",
      "Show emotional intelligence and empathy",
      "Demonstrate conflict resolution skills",
      "Highlight the positive outcome",
    ],
    followUps: [
      "How do you handle ongoing personality conflicts?",
      "What would you do if the situation didn't improve?",
      "How do you prevent such situations in the future?",
    ],
    tags: ["teamwork", "conflict-resolution", "communication", "leadership"],
    estimatedTime: 3,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-7",
    question:
      "Describe a situation where you had to learn a new technology quickly.",
    category: "behavioral",
    difficulty: "easy",
    type: "behavioral",
    sampleAnswer:
      "When our team decided to migrate from REST to GraphQL, I had only two weeks to become proficient. I started by reading the official documentation and taking an online course. I then built a small personal project to practice the concepts. I also reached out to developers in my network who had GraphQL experience for advice. Within the deadline, I was able to contribute meaningfully to the migration project and even helped onboard other team members.",
    approach:
      "STAR: Situation (technology migration), Task (learn GraphQL quickly), Action (documentation, course, practice project, networking), Result (successful contribution and knowledge sharing).",
    tips: [
      "Show your learning methodology",
      "Demonstrate resourcefulness",
      "Highlight how you applied the knowledge",
      "Mention knowledge sharing with others",
    ],
    followUps: [
      "How do you stay updated with new technologies?",
      "What's your preferred learning style?",
      "How do you balance learning with current responsibilities?",
    ],
    tags: ["learning", "adaptability", "technology", "self-development"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-8",
    question:
      "Give an example of when you had to make a decision with incomplete information.",
    category: "behavioral",
    difficulty: "hard",
    type: "behavioral",
    sampleAnswer:
      "During a product launch, we discovered a potential security vulnerability just days before release. We had limited time to investigate and couldn't delay the launch due to marketing commitments. I gathered the available information, consulted with security experts, and assessed the risk level. I decided to implement a temporary mitigation while planning a comprehensive fix for the next release. I also prepared a rollback plan. The launch was successful, and we addressed the issue completely in the following update.",
    approach:
      "STAR: Situation (security issue before launch), Task (decide with limited info), Action (gather info, consult experts, assess risk, implement mitigation), Result (successful launch with risk managed).",
    tips: [
      "Show your decision-making process",
      "Demonstrate risk assessment skills",
      "Highlight consultation with experts",
      "Explain contingency planning",
    ],
    followUps: [
      "How do you determine when you have enough information?",
      "What factors do you consider in risk assessment?",
      "How do you communicate uncertain decisions to stakeholders?",
    ],
    tags: [
      "decision-making",
      "risk-management",
      "leadership",
      "problem-solving",
    ],
    estimatedTime: 4,
    industry: ["tech", "management"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-9",
    question:
      "Tell me about a time when you received constructive criticism. How did you handle it?",
    category: "behavioral",
    difficulty: "easy",
    type: "behavioral",
    sampleAnswer:
      "During a code review, a senior developer pointed out that my code was functional but not very readable and lacked proper documentation. Initially, I felt defensive, but I realized they were trying to help me improve. I asked for specific examples and recommendations. I then refactored the code with better variable names, added comments, and wrote comprehensive documentation. I also asked them to review my future code more frequently. This feedback significantly improved my coding practices.",
    approach:
      "STAR: Situation (code review feedback), Task (improve code quality), Action (asked for specifics, refactored, sought ongoing feedback), Result (improved coding practices).",
    tips: [
      "Show you can receive feedback positively",
      "Demonstrate growth mindset",
      "Highlight specific actions taken",
      "Show appreciation for the feedback",
    ],
    followUps: [
      "How do you seek feedback proactively?",
      "What's the most valuable feedback you've received?",
      "How do you give feedback to others?",
    ],
    tags: ["feedback", "growth-mindset", "self-improvement", "communication"],
    estimatedTime: 3,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-10",
    question:
      "Describe a time when you had to persuade someone to see your point of view.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "Our product manager wanted to add a complex feature that I believed would negatively impact performance. Instead of just saying no, I prepared data showing the potential performance impact and user experience degradation. I also researched alternative solutions that could achieve similar business goals with less technical debt. I presented this information in a meeting, focusing on shared objectives like user satisfaction and system reliability. We agreed on a simpler implementation that met the business needs while maintaining performance.",
    approach:
      "STAR: Situation (disagreement on feature complexity), Task (persuade with data), Action (gathered evidence, researched alternatives, focused on shared goals), Result (agreed on better solution).",
    tips: [
      "Use data and evidence to support your position",
      "Focus on shared goals and objectives",
      "Show respect for the other person's perspective",
      "Demonstrate collaborative problem-solving",
    ],
    followUps: [
      "How do you handle situations where you can't reach agreement?",
      "What role does data play in your persuasion?",
      "How do you maintain relationships when you disagree?",
    ],
    tags: ["persuasion", "communication", "collaboration", "data-driven"],
    estimatedTime: 3,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-11",
    question:
      "Tell me about a time when you failed at something. What did you learn?",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "I once led a project to implement a new feature that ended up being delayed by three weeks due to poor initial planning. I had underestimated the complexity and didn't account for dependencies with other teams. I learned the importance of thorough planning, stakeholder communication, and building buffer time into estimates. I now use project management tools more effectively and conduct regular check-ins with all stakeholders. This experience made me a much better project planner.",
    approach:
      "STAR: Situation (project delay), Task (deliver feature), Action (poor planning), Result (learned better planning practices). Focus on learning and growth.",
    tips: [
      "Choose a real failure, not a disguised strength",
      "Take ownership without blaming others",
      "Focus heavily on what you learned",
      "Show how you've applied the learning since",
    ],
    followUps: [
      "How do you handle failure in general?",
      "What's the biggest lesson you've learned from a mistake?",
      "How do you prevent similar failures?",
    ],
    tags: ["failure", "learning", "growth-mindset", "accountability"],
    estimatedTime: 3,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-12",
    question:
      "Describe a time when you had to work under pressure or tight deadlines.",
    category: "behavioral",
    difficulty: "easy",
    type: "behavioral",
    sampleAnswer:
      "During a critical bug fix before a major client demo, I had only 4 hours to identify and resolve the issue. I started by reproducing the bug systematically, then used debugging tools to trace the root cause. I found it was a race condition in our async code. I implemented a fix, wrote tests to prevent regression, and deployed it with 30 minutes to spare. The demo went smoothly, and the client signed the contract.",
    approach:
      "STAR: Situation (critical bug before demo), Task (fix in 4 hours), Action (systematic debugging, fix, testing), Result (successful demo and contract).",
    tips: [
      "Show your systematic approach under pressure",
      "Highlight time management skills",
      "Demonstrate quality doesn't suffer under pressure",
      "Include the positive outcome",
    ],
    followUps: [
      "How do you manage stress?",
      "What tools help you work efficiently under pressure?",
      "How do you prioritize when everything seems urgent?",
    ],
    tags: ["pressure", "time-management", "problem-solving", "debugging"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-13",
    question:
      "Give an example of when you had to take initiative without being asked.",
    category: "behavioral",
    difficulty: "medium",
    type: "behavioral",
    sampleAnswer:
      "I noticed our team was spending a lot of time on repetitive deployment tasks. Without being asked, I researched CI/CD solutions and created a proof of concept using GitHub Actions. I presented it to the team, showing how it could save 2 hours per deployment. The team was enthusiastic, so I implemented the full solution. This reduced our deployment time from 2 hours to 15 minutes and eliminated human errors.",
    approach:
      "STAR: Situation (repetitive deployment tasks), Task (improve efficiency), Action (researched, created POC, implemented), Result (saved time, reduced errors).",
    tips: [
      "Show you identify problems proactively",
      "Demonstrate research and solution skills",
      "Highlight the business impact",
      "Show you can work independently",
    ],
    followUps: [
      "How do you identify opportunities for improvement?",
      "When is it appropriate to take initiative vs. ask permission?",
      "How do you get buy-in for your ideas?",
    ],
    tags: ["initiative", "proactive", "automation", "leadership"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-14",
    question:
      "Tell me about a time when you had to deal with ambiguous requirements.",
    category: "behavioral",
    difficulty: "hard",
    type: "behavioral",
    sampleAnswer:
      "A stakeholder asked for a 'user-friendly dashboard' without specific requirements. I scheduled a series of discovery sessions to understand their needs. I created wireframes and prototypes, gathering feedback iteratively. I also researched similar dashboards and best practices. Through this process, I clarified that they needed real-time metrics, customizable views, and mobile responsiveness. The final dashboard exceeded their expectations and became a template for other teams.",
    approach:
      "STAR: Situation (vague dashboard request), Task (clarify requirements), Action (discovery sessions, prototypes, research), Result (successful dashboard, template for others).",
    tips: [
      "Show your requirements gathering skills",
      "Demonstrate iterative approach",
      "Highlight stakeholder communication",
      "Show how you handle uncertainty",
    ],
    followUps: [
      "How do you handle conflicting requirements?",
      "What techniques do you use for requirements gathering?",
      "How do you manage scope creep?",
    ],
    tags: ["requirements", "ambiguity", "stakeholder-management", "discovery"],
    estimatedTime: 4,
    industry: ["tech", "product"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "beh-15",
    question:
      "Describe a situation where you had to give difficult feedback to a colleague.",
    category: "behavioral",
    difficulty: "hard",
    type: "behavioral",
    sampleAnswer:
      "A team member was consistently missing deadlines and their code quality was declining. I scheduled a private one-on-one meeting. I started by asking if they were facing any challenges, then shared specific examples of missed deadlines and code issues. I focused on the impact on the team and project. Together, we identified that they were overwhelmed with personal issues. We worked out a plan for better time management and I offered to help with code reviews. Their performance improved significantly.",
    approach:
      "STAR: Situation (colleague performance issues), Task (address problems), Action (private meeting, specific examples, collaborative solution), Result (improved performance).",
    tips: [
      "Show empathy and understanding",
      "Use specific examples, not generalizations",
      "Focus on behavior and impact, not personality",
      "Demonstrate collaborative problem-solving",
    ],
    followUps: [
      "How do you prepare for difficult conversations?",
      "What if the person doesn't respond well to feedback?",
      "How do you follow up after giving feedback?",
    ],
    tags: ["feedback", "difficult-conversations", "leadership", "empathy"],
    estimatedTime: 4,
    industry: ["tech", "management"],
    practiceCount: 0,
    successRate: 0,
  },
];
