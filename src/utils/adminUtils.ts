/**
 * Admin utilities - Check if user has admin privileges
 */

import { realTimeAuth } from "./realTimeAuth";

const ADMIN_EMAIL = "akshayjuluri6704@gmail.com";

/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  const user = realTimeAuth.getCurrentUser();
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if a specific email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

