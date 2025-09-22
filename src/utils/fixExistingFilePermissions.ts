// One-time fix for existing file permissions
// This script will update all existing files to use team-based permissions

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { realTimeAuth } from "./realTimeAuth";

export class ExistingFilePermissionsFixer {
  // Fix permissions for all files in teams where the current user is a member
  static async fixAllUserTeamFiles(): Promise<{
    teamsProcessed: number;
    filesUpdated: number;
    foldersUpdated: number;
    errors: string[];
  }> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("🔧 Starting to fix existing file permissions...");

    const results = {
      teamsProcessed: 0,
      filesUpdated: 0,
      foldersUpdated: 0,
      errors: [] as string[],
    };

    try {
      // Get all teams where user is a member
      const teamsQuery = query(collection(db, "teams"));
      const teamsSnapshot = await getDocs(teamsQuery);

      for (const teamDoc of teamsSnapshot.docs) {
        const teamData = teamDoc.data();
        const teamId = teamDoc.id;

        // Check if current user is a member of this team
        if (!teamData.members || !teamData.members[user.id]) {
          continue; // Skip teams where user is not a member
        }

        console.log(`📁 Processing team: ${teamData.name} (${teamId})`);
        results.teamsProcessed++;

        try {
          // Fix files in this team
          const fileResults = await this.fixTeamFilePermissions(
            teamId,
            teamData.members
          );
          results.filesUpdated += fileResults.filesUpdated;
          results.foldersUpdated += fileResults.foldersUpdated;
        } catch (error) {
          const errorMsg = `Error processing team ${teamData.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }

      console.log("✅ File permission fix completed!");
      console.log(
        `📊 Results: ${results.teamsProcessed} teams, ${results.filesUpdated} files, ${results.foldersUpdated} folders updated`
      );

      return results;
    } catch (error) {
      console.error("❌ Failed to fix file permissions:", error);
      throw error;
    }
  }

  // Fix permissions for a specific team
  static async fixTeamFilePermissions(
    teamId: string,
    teamMembers: Record<string, any>
  ): Promise<{
    filesUpdated: number;
    foldersUpdated: number;
  }> {
    console.log(`🔄 Fixing permissions for team: ${teamId}`);

    const results = {
      filesUpdated: 0,
      foldersUpdated: 0,
    };

    // Calculate correct permissions based on team members
    const correctPermissions = this.calculateTeamPermissions(teamMembers);

    // Get all files for this team
    const filesQuery = query(
      collection(db, "sharedFiles"),
      where("teamId", "==", teamId)
    );
    const filesSnapshot = await getDocs(filesQuery);

    // Get all folders for this team
    const foldersQuery = query(
      collection(db, "sharedFolders"),
      where("teamId", "==", teamId)
    );
    const foldersSnapshot = await getDocs(foldersQuery);

    // Use batch operations for better performance
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;

    // Process files
    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      const currentPermissions = fileData.permissions || {
        view: [],
        edit: [],
        admin: [],
      };

      // Check if permissions need updating
      if (this.permissionsNeedUpdate(currentPermissions, correctPermissions)) {
        batch.update(doc(db, "sharedFiles", fileDoc.id), {
          permissions: correctPermissions,
          lastModified: new Date(),
          lastModifiedBy: "system-permission-fix",
        });

        batchCount++;
        results.filesUpdated++;

        console.log(`📄 Updated file: ${fileData.fileName}`);

        // Execute batch if we reach the limit
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Process folders
    for (const folderDoc of foldersSnapshot.docs) {
      const folderData = folderDoc.data();
      const currentPermissions = folderData.permissions || {
        view: [],
        edit: [],
        admin: [],
      };

      // Check if permissions need updating
      if (this.permissionsNeedUpdate(currentPermissions, correctPermissions)) {
        batch.update(doc(db, "sharedFolders", folderDoc.id), {
          permissions: correctPermissions,
          lastModified: new Date(),
          lastModifiedBy: "system-permission-fix",
        });

        batchCount++;
        results.foldersUpdated++;

        console.log(`📁 Updated folder: ${folderData.folderName}`);

        // Execute batch if we reach the limit
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Execute remaining batch operations
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(
      `✅ Team ${teamId}: Updated ${results.filesUpdated} files and ${results.foldersUpdated} folders`
    );

    return results;
  }

  // Calculate correct permissions based on team members
  private static calculateTeamPermissions(teamMembers: Record<string, any>) {
    const permissions = {
      view: [] as string[],
      edit: [] as string[],
      admin: [] as string[],
    };

    Object.entries(teamMembers).forEach(([memberId, member]) => {
      const role = member.role || "member";

      switch (role) {
        case "owner":
        case "admin":
          permissions.admin.push(memberId);
          break;
        case "member":
          permissions.edit.push(memberId);
          break;
        case "viewer":
          permissions.view.push(memberId);
          break;
        default:
          permissions.view.push(memberId);
      }
    });

    return permissions;
  }

  // Check if permissions need updating
  private static permissionsNeedUpdate(current: any, correct: any): boolean {
    const currentView = (current.view || []).sort();
    const currentEdit = (current.edit || []).sort();
    const currentAdmin = (current.admin || []).sort();

    const correctView = (correct.view || []).sort();
    const correctEdit = (correct.edit || []).sort();
    const correctAdmin = (correct.admin || []).sort();

    return (
      JSON.stringify(currentView) !== JSON.stringify(correctView) ||
      JSON.stringify(currentEdit) !== JSON.stringify(correctEdit) ||
      JSON.stringify(currentAdmin) !== JSON.stringify(correctAdmin)
    );
  }

  // Fix permissions for a specific team (public method for manual use)
  static async fixSpecificTeam(teamId: string): Promise<{
    filesUpdated: number;
    foldersUpdated: number;
  }> {
    console.log(`🎯 Fixing permissions for specific team: ${teamId}`);

    // Get team data
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }

    const teamData = teamDoc.data();
    const teamMembers = teamData.members || {};

    return await this.fixTeamFilePermissions(teamId, teamMembers);
  }
}

// Convenience function to run the fix
export async function fixExistingFilePermissions() {
  try {
    console.log("🚀 Starting existing file permissions fix...");
    const results = await ExistingFilePermissionsFixer.fixAllUserTeamFiles();

    console.log("\n📊 SUMMARY:");
    console.log(`✅ Teams processed: ${results.teamsProcessed}`);
    console.log(`✅ Files updated: ${results.filesUpdated}`);
    console.log(`✅ Folders updated: ${results.foldersUpdated}`);

    if (results.errors.length > 0) {
      console.log(`⚠️ Errors encountered: ${results.errors.length}`);
      results.errors.forEach((error) => console.log(`  - ${error}`));
    }

    return results;
  } catch (error) {
    console.error("❌ Fix failed:", error);
    throw error;
  }
}

// Export for use in browser console
if (typeof window !== "undefined") {
  (window as any).fixExistingFilePermissions = fixExistingFilePermissions;
  (window as any).ExistingFilePermissionsFixer = ExistingFilePermissionsFixer;

  // Add a simple console command
  (window as any).fixMyFileAccess = async () => {
    console.log("🔧 Starting file access fix...");
    console.log(
      "This will update permissions for all files in teams you belong to."
    );
    console.log("Please wait...");

    try {
      const results = await fixExistingFilePermissions();
      console.log("\n🎉 SUCCESS! File access has been fixed!");
      console.log(
        `✅ Updated ${results.filesUpdated} files and ${results.foldersUpdated} folders`
      );
      console.log("💡 Refresh the page to see the updated files.");
      return results;
    } catch (error) {
      console.error("❌ Fix failed:", error);
      throw error;
    }
  };

  console.log("🔧 File Access Fix Available!");
  console.log("Run: fixMyFileAccess() in the console to fix file permissions");
}
