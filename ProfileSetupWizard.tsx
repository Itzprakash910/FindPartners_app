
import React, { useState, useRef } from 'react';
import { Profile } from '../types';
import { RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, LIFESTYLE_CHOICES } from '../constants';
import { compressImage } from '../utils';

interface ProfileSetupWizardProps {
  user: Profile;
  onComplete: (updatedProfile: Profile) => void;
}

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
    <div className="w-full mb-8">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-rose-700 dark:text-rose-300">Step {current} of {total}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-rose-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(current / total) * 100}%` }}></div>
        </div>
    </div>
);

const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Profile>(user);
    const [imagePreview, setImagePreview] = useState<string | null>(user.imageUrls ? user.imageUrls[0] : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const inputStyle = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors";
    const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) : value }));
    };

     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                setImagePreview(compressedBase64);
                setFormData(prev => ({ ...prev, imageUrls: [compressedBase64] }));
            } catch (error) {
                console.error("Error compressing image:", error);
                alert("Failed to process image. Please try a smaller file.");
            }
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete({ ...formData, isProfileComplete: true });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Tell us the basics</h2>
                        <p className="text-gray-600 dark:text-gray-400 -mt-4">Let's start with the essentials. This information helps others get to know you.</p>
                        <div>
                            <label htmlFor="name" className={labelStyle}>Full Name</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} placeholder="e.g., Priya Patel" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label htmlFor="age" className={labelStyle}>Age</label>
                                <input id="age" type="number" name="age" value={formData.age} onChange={handleChange} className={inputStyle} placeholder="28" required min="18" max="99"/>
                            </div>
                            <div>
                                <label htmlFor="gender" className={labelStyle}>Gender</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputStyle} required>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="phone" className={labelStyle}>Phone Number</label>
                            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="9876543210" required />
                        </div>
                         <div>
                            <label htmlFor="location" className={labelStyle}>Current Location</label>
                            <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className={inputStyle} placeholder="e.g., Mumbai, Maharashtra" required />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Lifestyle & Background</h2>
                        <p className="text-gray-600 dark:text-gray-400 -mt-4">Share a bit about your background and lifestyle to find a more compatible match.</p>
                         <div>
                            <label htmlFor="religion" className={labelStyle}>Religion</label>
                            <select id="religion" name="religion" value={formData.religion} onChange={handleChange} className={inputStyle} required>
                                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="occupation" className={labelStyle}>Occupation</label>
                                <select id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className={inputStyle} required>
                                    <option value="">Select Occupation</option>
                                    {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="education" className={labelStyle}>Highest Education</label>
                                <select id="education" name="education" value={formData.education} onChange={handleChange} className={inputStyle} required>
                                    <option value="">Select Education</option>
                                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="lifestyle" className={labelStyle}>Dietary Preference</label>
                            <select id="lifestyle" name="lifestyle" value={formData.lifestyle} onChange={handleChange} className={inputStyle} required>
                                {LIFESTYLE_CHOICES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Your Personality & Photo</h2>
                        <p className="text-gray-600 dark:text-gray-400 -mt-4">This is where your personality shines! A great bio and a clear photo make a huge difference.</p>
                        <div>
                            <label htmlFor="about" className={labelStyle}>About Yourself</label>
                            <textarea id="about" name="about" value={formData.about} onChange={handleChange} className={inputStyle} placeholder="Write a few lines about yourself, your interests, and what you're looking for in a partner..." required rows={5}></textarea>
                        </div>
                        <div>
                             <label className={labelStyle}>Upload Profile Photo</label>
                             <div className="flex items-center gap-4">
                                <img className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" src={imagePreview!} alt="Profile Preview" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">
                                    Choose Photo
                                </button>
                                <input id="photo-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} required/>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12">
                <ProgressBar current={step} total={3} />
                <form onSubmit={handleSubmit}>
                    <div className="min-h-[300px]">
                        {renderStep()}
                    </div>
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={prevStep} disabled={step === 1} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                            Back
                        </button>
                        {step < 3 ? (
                            <button type="button" onClick={nextStep} className="px-8 py-3 bg-rose-700 text-white font-semibold rounded-lg hover:bg-rose-800 transition-colors shadow-md">
                                Next
                            </button>
                        ) : (
                            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-rose-600 to-red-500 text-white font-semibold rounded-lg hover:from-rose-700 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg">
                                Finish & Find Matches
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupWizard;
