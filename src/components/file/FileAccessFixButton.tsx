import React, { useState } from 'react';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { autoFileAccessChecker } from '../../utils/autoFileAccessChecker';

interface FileAccessFixButtonProps {
  teamId?: string;
  className?: string;
}

export const FileAccessFixButton: React.FC<FileAccessFixButtonProps> = ({ 
  teamId, 
  className = '' 
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [lastFixResult, setLastFixResult] = useState<'success' | 'error' | null>(null);

  const handleFixAccess = async () => {
    setIsFixing(true);
    setLastFixResult(null);

    try {
      if (teamId) {
        // Fix access for specific team
        const success = await autoFileAccessChecker.ensureTeamFileAccess(teamId);
        setLastFixResult(success ? 'success' : 'error');
      } else {
        // Fix access for all teams
        await autoFileAccessChecker.ensureAllTeamsFileAccess();
        setLastFixResult('success');
      }

      // Reset result after 3 seconds
      setTimeout(() => setLastFixResult(null), 3000);
      
    } catch (error) {
      console.error('Fix access error:', error);
      setLastFixResult('error');
      setTimeout(() => setLastFixResult(null), 3000);
    } finally {
      setIsFixing(false);
    }
  };

  const getButtonContent = () => {
    if (isFixing) {
      return (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Fixing...
        </>
      );
    }

    if (lastFixResult === 'success') {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Fixed!
        </>
      );
    }

    if (lastFixResult === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2" />
          Error
        </>
      );
    }

    return (
      <>
        <Settings className="w-4 h-4 mr-2" />
        Fix File Access
      </>
    );
  };

  const getButtonColor = () => {
    if (lastFixResult === 'success') {
      return 'bg-green-500 hover:bg-green-600 text-white';
    }
    if (lastFixResult === 'error') {
      return 'bg-red-500 hover:bg-red-600 text-white';
    }
    return 'bg-blue-500 hover:bg-blue-600 text-white';
  };

  return (
    <button
      onClick={handleFixAccess}
      disabled={isFixing}
      className={`
        inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm
        transition-colors duration-200
        ${getButtonColor()}
        ${isFixing ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
      title={teamId ? 'Fix file access for this team' : 'Fix file access for all teams'}
    >
      {getButtonContent()}
    </button>
  );
};

export default FileAccessFixButton;
