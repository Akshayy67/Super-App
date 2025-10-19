import React, { useState } from 'react';
import { fixExistingFilePermissions, ExistingFilePermissionsFixer } from '../../utils/fixExistingFilePermissions';

interface FixResults {
  teamsProcessed: number;
  filesUpdated: number;
  foldersUpdated: number;
  errors: string[];
}

export const FilePermissionsFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<FixResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixPermissions = async () => {
    setIsFixing(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔧 Starting file permissions fix...');
      const fixResults = await fixExistingFilePermissions();
      setResults(fixResults);
      
      // Refresh the page after a short delay to show updated files
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      console.error('Fix failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔧 Fix File Permissions
        </h2>
        <p className="text-gray-600">
          This will update all existing files in your teams to use the new team-based permission system.
          After running this fix, you should be able to see all PDFs and files that were uploaded before you joined.
        </p>
      </div>

      {!results && !error && (
        <div className="text-center">
          <button
            onClick={handleFixPermissions}
            disabled={isFixing}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isFixing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isFixing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fixing Permissions...
              </span>
            ) : (
              'Fix File Permissions'
            )}
          </button>
        </div>
      )}

      {isFixing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="text-blue-800 font-medium">Updating file permissions...</p>
              <p className="text-blue-600 text-sm">This may take a few moments depending on how many files you have.</p>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="flex-1">
              <h3 className="text-green-800 font-medium mb-2">✅ Fix Completed Successfully!</h3>
              <div className="text-green-700 text-sm space-y-1">
                <p>📊 <strong>Teams processed:</strong> {results.teamsProcessed}</p>
                <p>📄 <strong>Files updated:</strong> {results.filesUpdated}</p>
                <p>📁 <strong>Folders updated:</strong> {results.foldersUpdated}</p>
              </div>
              
              {results.errors.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <p className="text-yellow-800 font-medium">⚠️ Some errors occurred:</p>
                  <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-blue-800 text-sm">
                  🔄 The page will refresh automatically in a few seconds to show the updated files.
                  You should now be able to see all the PDFs and files that were uploaded before you joined the team!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">❌ Fix Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setResults(null);
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-gray-800 font-medium mb-2">ℹ️ What this fix does:</h4>
        <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
          <li>Scans all teams you're a member of</li>
          <li>Updates file permissions to include all current team members</li>
          <li>Applies role-based permissions (owner/admin/member/viewer)</li>
          <li>Makes previously inaccessible files visible to you</li>
          <li>Only needs to be run once for existing files</li>
        </ul>
      </div>
    </div>
  );
};

export default FilePermissionsFixer;
