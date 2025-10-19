import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Privacy & Security Notice
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                How We Use Your Google Account
              </h3>
              <p className="text-blue-800 text-sm">
                We use Google OAuth2 for secure authentication. This means we never see or store your Google password.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-green-600" />
                  What We Access
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your name and email address</li>
                  <li>• Your profile picture (optional)</li>
                  <li>• Google Drive files you explicitly share</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-red-600" />
                  What We Don't Access
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your Google password</li>
                  <li>• All your Drive files automatically</li>
                  <li>• Your Gmail or other Google services</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Data Security & Storage</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• All data is encrypted in transit and at rest</p>
                <p>• We use Firebase's secure infrastructure for data storage</p>
                <p>• Your files are processed locally when possible</p>
                <p>• We never share your personal data with third parties</p>
                <p>• You can revoke access at any time through your Google Account settings</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Your Control</h3>
              <p className="text-yellow-800 text-sm">
                You maintain full control over your data. You can revoke our access to your Google account at any time 
                by visiting your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" 
                className="underline hover:no-underline">Google Account permissions page</a>.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Manage Permissions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
