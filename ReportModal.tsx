import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';

interface ReportModalProps {
  profile: Profile;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
}

const REPORT_REASONS = [
  'Inappropriate Content',
  'Fake Profile / Scammer',
  'Harassment or Hate Speech',
  'Underage User',
  'Other',
];

const ReportModal: React.FC<ReportModalProps> = ({ profile, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const detailsTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isOtherSelected = selectedReason === 'Other';

  useEffect(() => {
    if (isOtherSelected && detailsTextareaRef.current) {
      detailsTextareaRef.current.focus();
    }
  }, [isOtherSelected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReason) {
      onSubmit(selectedReason, details);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-rose-800 dark:text-rose-400">Report {profile.name}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Please select a reason for reporting this profile. Your feedback helps us keep the community safe.</p>
          <div className="space-y-3">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="report-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                />
                <span className="ml-3 text-gray-800 dark:text-gray-200">{reason}</span>
              </label>
            ))}
          </div>

          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOtherSelected ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Please provide more details:
            </label>
            <textarea
              id="details"
              ref={detailsTextareaRef}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 focus:ring-rose-500 focus:border-rose-500"
              placeholder="Help us understand what's happening..."
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-6 mt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || (isOtherSelected && !details.trim())}
              className="px-6 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;