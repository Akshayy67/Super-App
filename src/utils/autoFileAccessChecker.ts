// Auto File Access Checker
// Automatically ensures users have access to team files when they visit team pages

import { teamFilePermissionService } from "../team/utils/teamFilePermissionService";
import { realTimeAuth } from "./realTimeAuth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../config/firebase";

class AutoFileAccessChecker {
  private checkedTeams = new Set<string>();
  private isChecking = false;

  // Check and fix file access for a specific team
  async ensureTeamFileAccess(teamId: string): Promise<boolean> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      console.log("❌ No authenticated user for file access check");
      return false;
    }

    // Avoid duplicate checks for the same team in the same session
    const checkKey = `${teamId}-${user.id}`;
    if (this.checkedTeams.has(checkKey) || this.isChecking) {
      return true;
    }

    this.isChecking = true;

    try {
      console.log(`🔍 Checking file access for team: ${teamId}`);

      // Verify user is actually a team member
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (!teamDoc.exists()) {
        console.log("❌ Team not found");
        return false;
      }

      const teamData = teamDoc.data();
      if (!teamData?.members?.[user.id]) {
        console.log("❌ User is not a member of this team");
        return false;
      }

      // Check if user can access team files
      const hasAccess = await this.checkUserFileAccess(teamId, user.id);

      if (!hasAccess) {
        console.log("🔧 User missing file access, fixing automatically...");

        // Grant access to all team files
        const memberRole = teamData.members[user.id].role || "member";
        const updates =
          await teamFilePermissionService.grantTeamFileAccessToNewMember(
            teamId,
            user.id,
            memberRole
          );

        const updatedCount = updates.filter((u) => u.updated).length;
        if (updatedCount > 0) {
          console.log(
            `✅ Automatically granted access to ${updatedCount} files/folders`
          );

          // Show a brief notification to the user
          this.showAccessGrantedNotification(updatedCount);
        } else {
          console.log("ℹ️ No file permission updates needed");
        }
      } else {
        console.log("✅ User already has proper file access");
      }

      // Mark this team as checked for this session
      this.checkedTeams.add(checkKey);
      return true;
    } catch (error) {
      console.error("❌ Error checking/fixing file access:", error);
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  // Check if user has access to team files
  private async checkUserFileAccess(
    teamId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get a sample of team files to check access
      const filesQuery = query(
        collection(db, "sharedFiles"),
        where("teamId", "==", teamId)
      );

      const filesSnapshot = await getDocs(filesQuery);

      if (filesSnapshot.empty) {
        // No files in team, so access is not an issue
        return true;
      }

      // Check if user has access to the first few files
      let accessibleCount = 0;
      let totalChecked = 0;
      const maxCheck = Math.min(5, filesSnapshot.docs.length); // Check up to 5 files

      for (const fileDoc of filesSnapshot.docs.slice(0, maxCheck)) {
        const fileData = fileDoc.data();
        const permissions = fileData.permissions || {
          view: [],
          edit: [],
          admin: [],
        };

        const hasAccess =
          permissions.view.includes(userId) ||
          permissions.edit.includes(userId) ||
          permissions.admin.includes(userId);

        if (hasAccess) {
          accessibleCount++;
        }
        totalChecked++;
      }

      // If user has access to less than 80% of checked files, they likely need access fix
      const accessRatio = accessibleCount / totalChecked;
      return accessRatio >= 0.8;
    } catch (error) {
      console.error("Error checking file access:", error);
      return true; // Assume access is fine if we can't check
    }
  }

  // Show a brief notification that access was granted
  private showAccessGrantedNotification(fileCount: number) {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300";
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Access granted to ${fileCount} files!</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Check file access for all user's teams
  async ensureAllTeamsFileAccess(): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) return;

    try {
      console.log("🔍 Checking file access for all user teams...");

      // Get all teams where user is a member
      const teamsQuery = query(collection(db, "teams"));
      const teamsSnapshot = await getDocs(teamsQuery);

      const userTeams = teamsSnapshot.docs.filter((doc) => {
        const teamData = doc.data();
        return teamData.members && teamData.members[user.id];
      });

      console.log(`Found ${userTeams.length} teams for user`);

      // Check each team
      for (const teamDoc of userTeams) {
        await this.ensureTeamFileAccess(teamDoc.id);
      }
    } catch (error) {
      console.error("Error checking all teams file access:", error);
    }
  }

  // Reset checked teams (useful for testing or when user changes)
  resetCheckedTeams() {
    this.checkedTeams.clear();
  }
}

export const autoFileAccessChecker = new AutoFileAccessChecker();

// Auto-run when user authentication changes
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    // Reset checked teams when user changes
    autoFileAccessChecker.resetCheckedTeams();

    // Check file access for all teams after a short delay
    setTimeout(() => {
      autoFileAccessChecker.ensureAllTeamsFileAccess();
    }, 2000);
  }
});

// Export for manual use
export { AutoFileAccessChecker };
