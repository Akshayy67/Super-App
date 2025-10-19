import React from 'react';
import { Brain } from 'lucide-react';

interface DoubtDiscussionProps {
  teamId: string;
  userId: string;
  userName: string;
  userRole: string;
  className?: string;
}

export const DoubtDiscussionComponent: React.FC<DoubtDiscussionProps> = ({
  teamId,
  userId,
  userName,
  userRole,
  className = '',
}) => {
  return (
    <div className={`flex h-full ${className}`}>
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Doubt Discussion</h3>
          <p className="text-sm">Doubt discussion feature coming soon</p>
        </div>
      </div>
    </div>
  );
};
