import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Eye, 
  Edit3, 
  UserMinus, 
  Crown, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive?: Date;
  status: 'online' | 'away' | 'offline';
}

interface TeamRoleManagerProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer';
  onRoleChange: (memberId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => void;
  onRemoveMember: (memberId: string) => void;
}

const roleHierarchy = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1
};

const rolePermissions = {
  owner: {
    canManageTeam: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canShareFiles: true,
    canEditFiles: true,
    canViewFiles: true,
    canManageSettings: true,
    canDeleteTeam: true
  },
  admin: {
    canManageTeam: false,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canShareFiles: true,
    canEditFiles: true,
    canViewFiles: true,
    canManageSettings: true,
    canDeleteTeam: false
  },
  member: {
    canManageTeam: false,
    canInviteMembers: true,
    canRemoveMembers: false,
    canChangeRoles: false,
    canShareFiles: true,
    canEditFiles: true,
    canViewFiles: true,
    canManageSettings: false,
    canDeleteTeam: false
  },
  viewer: {
    canManageTeam: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canShareFiles: false,
    canEditFiles: false,
    canViewFiles: true,
    canManageSettings: false,
    canDeleteTeam: false
  }
};

export const TeamRoleManager: React.FC<TeamRoleManagerProps> = ({
  teamMembers,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemoveMember
}) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role-change' | 'remove-member';
    memberId: string;
    newRole?: string;
  } | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'member':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'member':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canChangeRole = (targetMember: TeamMember, newRole: string): boolean => {
    // Can't change your own role
    if (targetMember.id === currentUserId) return false;
    
    // Only owner can change roles to/from owner
    if (newRole === 'owner' || targetMember.role === 'owner') {
      return currentUserRole === 'owner';
    }
    
    // Admin and owner can change other roles
    const currentHierarchy = roleHierarchy[currentUserRole];
    const targetHierarchy = roleHierarchy[targetMember.role];
    const newHierarchy = roleHierarchy[newRole as keyof typeof roleHierarchy];
    
    return currentHierarchy > targetHierarchy && currentHierarchy > newHierarchy;
  };

  const canRemoveMember = (targetMember: TeamMember): boolean => {
    // Can't remove yourself
    if (targetMember.id === currentUserId) return false;
    
    // Can't remove owner
    if (targetMember.role === 'owner') return false;
    
    // Owner and admin can remove lower hierarchy members
    const currentHierarchy = roleHierarchy[currentUserRole];
    const targetHierarchy = roleHierarchy[targetMember.role];
    
    return currentHierarchy > targetHierarchy;
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setConfirmAction({
      type: 'role-change',
      memberId,
      newRole
    });
    setShowConfirmDialog(true);
  };

  const handleRemoveMember = (memberId: string) => {
    setConfirmAction({
      type: 'remove-member',
      memberId
    });
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'role-change' && confirmAction.newRole) {
      onRoleChange(confirmAction.memberId, confirmAction.newRole as any);
    } else if (confirmAction.type === 'remove-member') {
      onRemoveMember(confirmAction.memberId);
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const getPermissionsList = (role: string) => {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    return Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
      .map(permission => permission.charAt(0).toUpperCase() + permission.slice(1));
  };

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Team Role Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(roleHierarchy).map(([role, _]) => {
            const count = teamMembers.filter(member => member.role === role).length;
            return (
              <div key={role} className="flex items-center gap-2">
                {getRoleIcon(role)}
                <span className="capitalize">{role}s: {count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {member.name[0]?.toUpperCase() || member.email[0].toUpperCase()}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.status === 'online' ? 'bg-green-500' : 
                  member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {member.name || member.email}
                    {member.id === currentUserId && (
                      <span className="text-sm text-gray-500 ml-1">(You)</span>
                    )}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                <p className="text-xs text-gray-500">
                  Joined {member.joinedAt.toLocaleDateString()}
                  {member.lastActive && (
                    <> • Last active {member.lastActive.toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Role Selector */}
              {member.id !== currentUserId && (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  disabled={!canChangeRole(member, member.role)}
                >
                  {Object.keys(roleHierarchy).map((role) => (
                    <option
                      key={role}
                      value={role}
                      disabled={!canChangeRole(member, role)}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              {/* View Permissions Button */}
              <button
                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Permissions"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Remove Member Button */}
              {canRemoveMember(member) && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove Member"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Member Permissions Details */}
      {selectedMember && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              {getRoleIcon(selectedMember.role)}
              {selectedMember.name || selectedMember.email} - {selectedMember.role} Permissions
            </h3>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(rolePermissions[selectedMember.role]).map(([permission, allowed]) => (
              <div key={permission} className="flex items-center gap-2">
                {allowed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${allowed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Action</h3>
            </div>
            
            <div className="mb-6">
              {confirmAction.type === 'role-change' ? (
                <p className="text-gray-600">
                  Are you sure you want to change this member's role to{' '}
                  <span className="font-medium">{confirmAction.newRole}</span>?
                  This will immediately update their permissions.
                </p>
              ) : (
                <p className="text-gray-600">
                  Are you sure you want to remove this member from the team?
                  They will lose access to all team resources immediately.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmAction.type === 'remove-member'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmAction.type === 'role-change' ? 'Change Role' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
