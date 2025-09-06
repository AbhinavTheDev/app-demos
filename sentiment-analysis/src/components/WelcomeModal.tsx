import React from 'react';
import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSubmit: (companyInfo: string) => void;
}

export function WelcomeModal({ isOpen, onSubmit }: WelcomeModalProps) {
  const [companyInfo, setCompanyInfo] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyInfo.trim()) {
      onSubmit(companyInfo);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Welcome to Sentiment Dashboard</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="companyInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your company name or brief description
            </label>
            <input
              id="companyInfo"
              type="text"
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              placeholder="e.g., Tesla - Electric vehicles and clean energy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Start Analysis
          </button>
        </form>
      </div>
    </div>
  );
}