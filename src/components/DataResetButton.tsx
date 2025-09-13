import React, { useState } from 'react';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { DataCleaner } from '../utils/dataCleaner';

interface DataResetButtonProps {
  className?: string;
  variant?: 'button' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

export const DataResetButton: React.FC<DataResetButtonProps> = ({
  className = '',
  variant = 'button',
  size = 'md'
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      // Clear all interview data
      DataCleaner.clearAllInterviewData();
      
      // Verify data was cleared
      const isCleared = DataCleaner.verifyDataCleared();
      
      if (isCleared) {
        console.log('✅ All interview data cleared successfully!');
        
        // Show success message
        alert('✅ All stored interview data has been cleared! The page will reload to start fresh.');
        
        // Reload page to start fresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.warn('⚠️ Some data may not have been cleared completely');
        alert('⚠️ Data clearing completed, but some items may remain. Please check console for details.');
      }
    } catch (error) {
      console.error('❌ Error during data reset:', error);
      alert('❌ Error occurred during data reset. Please try again or check console for details.');
    } finally {
      setIsResetting(false);
      setShowConfirmation(false);
    }
  };

  const handleConfirmReset = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    if (variant === 'link') {
      return 'text-red-600 hover:text-red-800 underline bg-transparent border-none p-0';
    }
    return 'bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded-lg';
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Clear All Interview Data?
            </h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• All stored interview results and analytics</li>
              <li>• Performance history and trends</li>
              <li>• Sample/demo data</li>
              <li>• Analytics settings and preferences</li>
              <li>• Cached analysis data</li>
            </ul>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone!
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isResetting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConfirmReset}
      disabled={isResetting}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        flex items-center gap-2
      `}
      title="Clear all stored interview data and start fresh"
    >
      {isResetting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Clearing...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </>
      )}
    </button>
  );
};

export default DataResetButton;
