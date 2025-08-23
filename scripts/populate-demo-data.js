import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseConfig } from "../src/config/firebase";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo data population script
export async function populateDemoTeamData() {
  try {
    console.log("Starting demo data population...");

    // Create demo team
    const teamId = "team_demo_123";
    const teamData = {
      id: teamId,
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
          joinedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
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
          joinedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          isOnline: false,
          skills: ["React", "TypeScript", "UI/UX"],
          stats: {
            tasksCompleted: 12,
            projectsContributed: 2,
            documentsCreated: 5,
            hoursLogged: 80,
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "teams", teamId), teamData);
    console.log("✅ Team created successfully");

    // Create demo projects
    const projects = [
      {
        id: "project_demo_1",
        teamId: teamId,
        name: "Mobile App Development",
        description: "Building a mobile app for our team collaboration needs",
        status: "active",
        priority: "high",
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        progress: 65,
        members: ["user_demo_owner", "user_demo_member1"],
        tasks: 15,
        completedTasks: 10,
        documents: [],
        tags: ["mobile", "react-native", "urgent"],
        color: "bg-blue-500",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "project_demo_2",
        teamId: teamId,
        name: "Website Redesign",
        description:
          "Modernizing our team website with new design and functionality",
        status: "planning",
        priority: "medium",
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        progress: 20,
        members: ["user_demo_member1"],
        tasks: 8,
        completedTasks: 2,
        documents: [],
        tags: ["web", "design", "frontend"],
        color: "bg-green-500",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const project of projects) {
      await setDoc(doc(db, "projects", project.id), project);
      console.log(`✅ Project "${project.name}" created successfully`);
    }

    // Create demo activities
    const activities = [
      {
        id: "activity_1",
        teamId: teamId,
        userId: "user_demo_owner",
        userName: "Team Owner",
        action: "created team",
        target: "Super Study Team",
        timestamp: serverTimestamp(),
        type: "team",
      },
      {
        id: "activity_2",
        teamId: teamId,
        userId: "user_demo_owner",
        userName: "Team Owner",
        action: "created project",
        target: "Mobile App Development",
        timestamp: serverTimestamp(),
        type: "project",
      },
    ];

    for (const activity of activities) {
      await setDoc(doc(db, "activities", activity.id), activity);
      console.log(`✅ Activity "${activity.action}" created successfully`);
    }

    // Create demo messages
    const messages = [
      {
        id: "msg_1",
        teamId: teamId,
        userId: "user_demo_owner",
        userName: "Team Owner",
        message: "Welcome to our team! Let's get started on our projects.",
        timestamp: serverTimestamp(),
      },
      {
        id: "msg_2",
        teamId: teamId,
        userId: "user_demo_member1",
        userName: "Alice Johnson",
        message: "Thanks for the welcome! Excited to work with everyone.",
        timestamp: serverTimestamp(),
      },
    ];

    for (const message of messages) {
      await setDoc(doc(db, "teamMessages", message.id), message);
      console.log(`✅ Message from "${message.userName}" created successfully`);
    }

    console.log("🎉 All demo data populated successfully!");

    return {
      success: true,
      teamId: teamId,
      message: "Demo data created successfully",
    };
  } catch (error) {
    console.error("❌ Error populating demo data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run this function in browser console or create a temporary component to call it
// populateDemoTeamData();
