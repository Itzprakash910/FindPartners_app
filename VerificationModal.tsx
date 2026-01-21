
import React, { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { compressImage } from '../utils';

interface VerificationModalProps {
    onClose: () => void;
    onVerified: () => void;
}

type VerificationStep = 'intro' | 'upload' | 'pending' | 'complete';

const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, onVerified }) => {
    const [step, setStep] = useState<VerificationStep>('intro');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            try {
                const compressedPreview = await compressImage(selectedFile);
                setFilePreview(compressedPreview);
            } catch (error) {
                console.error("Image processing error", error);
                // Fallback to simple URL if compression fails
                setFilePreview(URL.createObjectURL(selectedFile));
            }
        } else {
            alert('Please select a valid image file.');
        }
    };
    
    const handleSubmit = () => {
        if (!file) {
            alert('Please upload a document first.');
            return;
        }
        setStep('pending');
        // Simulate an API call
        setTimeout(() => {
            setStep('complete');
        }, 2000);
    };
    
    const handleFinish = () => {
        onVerified();
    }

    const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16a4 4 0 01-4 4H7z" /></svg>;
    const VerifiedBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                           <VerifiedBadgeIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Get Your Profile Verified</h3>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Verified profiles build more trust and get up to 3x more matches. Verify your identity with a government-issued ID to get the blue badge.</p>
                        <ul className="mt-4 text-left text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                           <li>✅ Your ID is used for verification only and is never shared.</li>
                           <li>✅ The process is quick, secure, and easy.</li>
                        </ul>
                        <button onClick={() => setStep('upload')} className="mt-8 w-full px-4 py-3 bg-rose-800 text-white font-semibold rounded-lg hover:bg-rose-900 transition-colors">Get Started</button>
                    </div>
                );
            case 'upload':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">Upload Your ID</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">Please upload a clear picture of your Driver's License, Passport, or Aadhar card.</p>
                        <div 
                            className="mt-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-rose-500 dark:hover:border-rose-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {filePreview ? (
                                <img src={filePreview} alt="ID Preview" className="max-h-40 mx-auto rounded-md" />
                            ) : (
                                <>
                                    <UploadIcon />
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to browse or drag & drop</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, or GIF up to 5MB</p>
                                </>
                            )}
                        </div>
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden" 
                        />
                        {file && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">File selected: {file.name}</p>}
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setStep('intro')} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Back</button>
                            <button onClick={handleSubmit} disabled={!file} className="px-6 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">Submit</button>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="text-center py-12">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Submitting your document for review...</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="text-center">
                         <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                           <CheckCircleIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Submission Complete!</h3>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Your document has been submitted successfully. Our team will review it, and your profile will be updated within 24 hours. You can now close this window.</p>
                        <button onClick={handleFinish} className="mt-8 w-full px-4 py-3 bg-rose-800 text-white font-semibold rounded-lg hover:bg-rose-900 transition-colors">Done</button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-6 sm:p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
