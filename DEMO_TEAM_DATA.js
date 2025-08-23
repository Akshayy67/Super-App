// Demo data for testing Team Space functionality
// Add this data manually through Firebase Console or create it programmatically

export const demoTeamData = {
  // Sample team document for teams collection
  team_demo_123: {
    id: "team_demo_123",
    name: "Super Study Team",
    description: "A demo team for testing team space functionality",
    size: "small",
    ownerId: "user_demo_owner",
    members: {
      user_demo_owner: {
        id: "user_demo_owner",
        name: "Team Owner",
        email: "owner@example.com",
        role: "owner",
        joinedAt: new Date(),
        lastActive: new Date(),
        isOnline: true,
        skills: ["Leadership", "Project Management"],
        stats: {
          tasksCompleted: 15,
          projectsContributed: 3,
          documentsCreated: 8,
          hoursLogged: 120,
        },
      },
      user_demo_member1: {
        id: "user_demo_member1",
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "admin",
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isOnline: false,
        skills: ["React", "TypeScript", "UI/UX"],
        stats: {
          tasksCompleted: 12,
          projectsContributed: 2,
          documentsCreated: 5,
          hoursLogged: 80,
        },
      },
      user_demo_member2: {
        id: "user_demo_member2",
        name: "Bob Smith",
        email: "bob@example.com",
        role: "member",
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isOnline: true,
        skills: ["Backend", "Node.js", "Database"],
        stats: {
          tasksCompleted: 8,
          projectsContributed: 1,
          documentsCreated: 3,
          hoursLogged: 45,
        },
      },
    },
    projects: ["project_demo_1", "project_demo_2"],
    settings: {
      isPublic: false,
      allowInvites: true,
      requireApproval: true,
      defaultRole: "member",
    },
    inviteCode: "DEMO123ABC",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    updatedAt: new Date(),
  },

  // Sample projects for projects collection
  projects: [
    {
      id: "project_demo_1",
      teamId: "team_demo_123",
      name: "Mobile App Development",
      description: "Building a mobile app for our team collaboration needs",
      status: "active",
      priority: "high",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      progress: 65,
      members: ["user_demo_owner", "user_demo_member1"],
      tasks: 15,
      completedTasks: 10,
      documents: [],
      tags: ["mobile", "react-native", "urgent"],
      color: "bg-blue-500",
    },
    {
      id: "project_demo_2",
      teamId: "team_demo_123",
      name: "Website Redesign",
      description:
        "Modernizing our team website with new design and functionality",
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 20,
      members: ["user_demo_member1", "user_demo_member2"],
      tasks: 8,
      completedTasks: 2,
      documents: [],
      tags: ["web", "design", "frontend"],
      color: "bg-green-500",
    },
  ],

  // Sample activities for activities collection
  activities: [
    {
      id: "activity_1",
      teamId: "team_demo_123",
      userId: "user_demo_owner",
      userName: "Team Owner",
      action: "created project",
      target: "Mobile App Development",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "project",
    },
    {
      id: "activity_2",
      teamId: "team_demo_123",
      userId: "user_demo_member1",
      userName: "Alice Johnson",
      action: "joined team",
      target: "Super Study Team",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: "member",
    },
  ],

  // Sample messages for teamMessages collection
  messages: [
    {
      id: "msg_1",
      teamId: "team_demo_123",
      userId: "user_demo_owner",
      userName: "Team Owner",
      message: "Welcome to our team! Let's get started on our projects.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "msg_2",
      teamId: "team_demo_123",
      userId: "user_demo_member1",
      userName: "Alice Johnson",
      message: "Thanks for the welcome! Excited to work with everyone.",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  ],
};

// Instructions for adding demo data:
// 1. Go to Firebase Console > Firestore Database
// 2. Create these collections if they don't exist: teams, projects, activities, teamMessages
// 3. Add the documents with the data structure shown above
// 4. Make sure to convert dates to Firestore timestamps
// 5. Update user IDs to match actual authenticated user IDs for testing
