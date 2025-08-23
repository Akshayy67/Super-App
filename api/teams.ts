import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../src/config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { emailService } from '../src/utils/emailService';

interface TeamData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    allowFileSharing: boolean;
    allowChat: boolean;
    allowVideoCall: boolean;
    maxMembers: number;
  };
  inviteCode?: string;
}

// GET /api/teams - Get all teams for a user
// POST /api/teams - Create a new team
// PUT /api/teams/:id - Update team
// DELETE /api/teams/:id - Delete team
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: urlQuery, body } = req;
  const teamId = urlQuery.id as string;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        if (teamId) {
          return await getTeam(req, res, teamId);
        } else {
          return await getTeams(req, res);
        }

      case 'POST':
        if (urlQuery.action === 'join') {
          return await joinTeamByCode(req, res);
        } else {
          return await createTeam(req, res);
        }

      case 'PUT':
        return await updateTeam(req, res, teamId);

      case 'DELETE':
        return await deleteTeam(req, res, teamId);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get all teams for a user
async function getTeams(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const teamsRef = collection(db, 'teams');
    // Use simple query to avoid index requirements
    const q = query(
      teamsRef,
      where('members', 'array-contains', userId as string)
    );

    const snapshot = await getDocs(q);
    const teams: TeamData[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      teams.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TeamData);
    });

    // Sort in memory by updatedAt
    teams.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return res.status(200).json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ error: 'Failed to fetch teams' });
  }
}

// Get a specific team
async function getTeam(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    const team: TeamData = {
      id: teamDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as TeamData;

    return res.status(200).json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ error: 'Failed to fetch team' });
  }
}

// Create a new team
async function createTeam(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, ownerId } = req.body;

  if (!name || !ownerId) {
    return res.status(400).json({ error: 'Team name and owner ID are required' });
  }

  try {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const team: TeamData = {
      id: teamId,
      name,
      description: description || '',
      ownerId,
      members: [ownerId],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        allowFileSharing: true,
        allowChat: true,
        allowVideoCall: false,
        maxMembers: 50
      },
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    await setDoc(doc(db, 'teams', teamId), {
      ...team,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return res.status(201).json({ team, message: 'Team created successfully' });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ error: 'Failed to create team' });
  }
}

// Update a team
async function updateTeam(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  const { name, description, settings, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if team exists and user has permission
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (teamData.ownerId !== userId) {
      return res.status(403).json({ error: 'Only team owner can update team settings' });
    }

    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings) updateData.settings = { ...teamData.settings, ...settings };

    await updateDoc(doc(db, 'teams', teamId), updateData);

    return res.status(200).json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ error: 'Failed to update team' });
  }
}

// Delete a team
async function deleteTeam(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if team exists and user has permission
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (teamData.ownerId !== userId) {
      return res.status(403).json({ error: 'Only team owner can delete team' });
    }

    await deleteDoc(doc(db, 'teams', teamId));

    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ error: 'Failed to delete team' });
  }
}

// Join team by invite code
async function joinTeamByCode(req: NextApiRequest, res: NextApiResponse) {
  const { inviteCode, userId } = req.body;

  if (!inviteCode || !userId) {
    return res.status(400).json({ error: 'Invite code and user ID are required' });
  }

  try {
    // Get invite details
    const invite = await emailService.getInviteByCode(inviteCode);
    
    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'This invitation has already been used or expired' });
    }

    // Check if team exists
    const teamDoc = await getDoc(doc(db, 'teams', invite.teamId));
    if (!teamDoc.exists()) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    
    // Check if user is already a member
    if (teamData?.members?.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Check team member limit
    if (teamData?.members?.length >= teamData?.settings?.maxMembers) {
      return res.status(400).json({ error: 'Team has reached maximum member limit' });
    }

    // Add user to team
    await updateDoc(doc(db, 'teams', invite.teamId), {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });

    // Mark invite as accepted
    await emailService.acceptInvite(invite.id, userId);

    return res.status(200).json({ 
      message: `Successfully joined team "${invite.teamName}"!`,
      teamId: invite.teamId,
      teamName: invite.teamName
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return res.status(500).json({ error: 'Failed to join team' });
  }
}
