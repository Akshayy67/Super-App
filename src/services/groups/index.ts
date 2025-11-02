/**
 * Groups Services Index
 * 
 * Main export file that re-exports all groups-related services
 */

export { groupManagementService } from "./groupManagementService";
export { groupInvitesService } from "./groupInvitesService";

// Re-export types
export * from "../../types/groups";

// For backward compatibility - export as groupsService
import { groupManagementService } from "./groupManagementService";
export const groupsService = groupManagementService;

