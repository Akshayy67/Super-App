import React, { useState } from "react";
import { Users, Mail, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { emailService } from "../../utils/emailService";
import { teamManagementService } from "../utils/teamManagement";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode?: string;
  onTeamJoined?: () => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  isOpen,
  onClose,
  inviteCode: initialInviteCode,
  onTeamJoined,
}) => {
  const [inviteCode, setInviteCode] = useState(initialInviteCode || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  const user = realTimeAuth.getCurrentUser();

  const handleJoinTeam = async () => {
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get invite details
      const invite = await emailService.getInviteByCode(inviteCode.trim());

      if (!invite) {
        setError("Invalid or expired invite code");
        return;
      }

      if (invite.status !== "pending") {
        setError("This invitation has already been used or expired");
        return;
      }

      // Check if user is already a member
      const teamDoc = await getDoc(doc(db, "teams", invite.teamId));
      if (!teamDoc.exists()) {
        setError("Team not found");
        return;
      }

      const teamData = teamDoc.data();
      if (teamData?.members?.[user.id]) {
        setError("You are already a member of this team");
        return;
      }

      // The team management service will handle creating the member object

      // Use the team management service to properly join the team
      // This will automatically grant file access to the new member
      await teamManagementService.joinTeamByInviteCode(inviteCode);

      // Mark invite as accepted
      await emailService.acceptInvite(invite.id, user.id);

      setSuccess(`Successfully joined team "${invite.teamName}"!`);
      setInviteDetails(invite);

      // Call the callback to refresh teams
      onTeamJoined?.();

      // Close modal after delay
      setTimeout(() => {
        onClose();
        setInviteCode("");
        setSuccess(null);
        setInviteDetails(null);
      }, 3000);
    } catch (error) {
      console.error("Error joining team:", error);
      setError("Failed to join team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Join Team</h2>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {success}
            </h3>
            {inviteDetails && (
              <p className="text-sm text-gray-600 mb-4">
                You can now access the team from your team list.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code (e.g., ABC123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg tracking-wider"
                maxLength={8}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Mail className="w-4 h-4" />
                <span>
                  Enter the invite code you received via email to join a team.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Join Team
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
