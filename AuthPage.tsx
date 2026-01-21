
import React, { useState } from 'react';
import { APP_TITLE } from '../constants';
import { Profile } from '../types';
import { registerUser, authenticateUser, verifyUserEmail } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';

interface AuthPageProps {
  onLoginSuccess: (user: Profile, isNewUser: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'verification';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login
  
  // Form state
  const [identifier, setIdentifier] = useState(''); // Acts as Email for signup, Email/Phone for login
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Internal tracking for verification flow
  const [pendingVerificationToken, setPendingVerificationToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Reduced network delay for faster user experience
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        if (mode === 'signup') {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters long.");
            }
            // Strict email validation for signup
            if (!identifier.includes('@') || !identifier.includes('.')) {
                throw new Error("Please enter a valid email address for registration.");
            }

            const newUser = registerUser(identifier, password);
            setPendingVerificationToken(newUser.verificationToken || null);
            setMode('verification');
            setSuccessMessage(`Account created! To activate, enter the verification code: ${newUser.verificationToken}`);
            // In a real app, this token is sent via email. Here we show it for demo purposes.
        } 
        else if (mode === 'login') {
            const user = authenticateUser(identifier, password);
            if (user) {
                onLoginSuccess(user, false);
            } else {
                throw new Error("Invalid credentials. Please check your email/phone and password.");
            }
        } 
        else if (mode === 'verification') {
            if (verifyUserEmail(identifier, verificationCode)) {
                // Auto-login after verification
                const user = authenticateUser(identifier, password);
                if (user) {
                    onLoginSuccess(user, true); // true = isNewUser -> triggers setup wizard
                } else {
                    setMode('login');
                    setSuccessMessage("Email verified successfully! Please log in.");
                }
            } else {
                throw new Error("Invalid verification code. Please try again.");
            }
        }
    } catch (err: any) {
        setError(err.message || "An error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 outline-none hover:bg-white dark:hover:bg-gray-700";
  const labelClasses = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1";

  const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-rose-600 drop-shadow-md">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.185 15.185 0 01-3.044-2.03.537.537 0 01-.028-.035l-.04-.047-.056-.067a1.001 1.001 0 01-.164-.206 1.745 1.745 0 01-.22-.258c-.196-.283-.356-.566-.467-.848a8.48 8.48 0 01-.433-1.42.526.526 0 01.035-.155.537.537 0 01.09-.168l.012-.019.019-.026.035-.041.054-.057a1.83 1.83 0 01.218-.218.891.891 0 01.21-.144c.123-.07.24-.128.352-.18.12-.054.237-.1.352-.144.113-.043.225-.08.336-.113a7.503 7.503 0 012.28-1.04c.158-.03.317-.052.477-.068a.57.57 0 01.066-.011 13.98 13.98 0 014.28 0 .57.57 0 01.066.011 7.503 7.503 0 012.757 1.22c.111.033.223.07.336.113.115.044.232.09.352.144.123.07.24.128.352.18.077.05.152.1.222.152.073.053.143.108.209.165l.054.057.035.041.019.026.012.019a.537.537 0 01.09.168.526.526 0 01.035.155 8.48 8.48 0 01-.433 1.42c-.11.282-.27.565-.467.848a1.745 1.745 0 01-.22.258 1.001 1.001 0 01-.164-.206l-.056.067-.04.047a.537.537 0 01-.028.035A15.185 15.185 0 0113.31 18.3a15.247 15.247 0 01-1.383.597l-.022.012-.007.003z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm dark:bg-gray-900/80"></div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 animate-fade-in">
            
            <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full animate-pop-in">
                    <HeartIcon />
                </div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white tracking-wide">
                    {APP_TITLE}
                </h1>
                <p className="text-rose-600 dark:text-rose-400 font-medium mt-1">
                    {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Find Your Perfect Match' : 'Verify Your Account'}
                </p>
            </div>

            {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-sm flex items-start animate-slide-down">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
            </div>
            )}

            {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm flex items-start animate-slide-down">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="break-all">{successMessage}</span>
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
            {mode !== 'verification' && (
                <div>
                    <label htmlFor="identifier" className={labelClasses}>
                        {mode === 'signup' ? 'Email Address' : 'Email or Phone'}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>
                        <input
                            id="identifier"
                            type={mode === 'signup' ? 'email' : 'text'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className={inputClasses}
                            placeholder={mode === 'signup' ? 'name@example.com' : 'email or phone number'}
                            required
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {mode === 'verification' && (
                <div>
                    <label htmlFor="code" className={labelClasses}>Verification Code</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            id="code"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className={`${inputClasses} tracking-[0.5em] text-center font-bold font-mono text-lg`}
                            placeholder="TOKEN"
                            required
                        />
                    </div>
                </div>
            )}

            {mode !== 'verification' && (
                <div>
                    <label htmlFor="password" className={labelClasses}>Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H5V7a3 3 0 116 0v2h1V7a5 5 0 00-5-5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClasses} pr-10`}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-500 transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {mode === 'signup' && (
                <div>
                    <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H5V7a3 3 0 116 0v2h1V7a5 5 0 00-5-5z" clipRule="evenodd" /></svg>
                        </div>
                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-rose-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-2"
            >
                {isLoading ? <LoadingSpinner /> : (
                    mode === 'login' ? 'Log In' : 
                    mode === 'signup' ? 'Create Free Account' : 
                    'Verify & Access'
                )}
            </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                {mode !== 'verification' ? (
                    <p className="text-gray-600 dark:text-gray-400">
                        {mode === 'login' ? "New to FindPartners? " : "Already a member? "}
                        <button 
                            onClick={toggleMode} 
                            className="text-rose-600 dark:text-rose-400 font-bold hover:underline focus:outline-none ml-1 transition-colors"
                        >
                            {mode === 'login' ? 'Create Account' : 'Log In'}
                        </button>
                    </p>
                ) : (
                    <button 
                        onClick={() => { setMode('signup'); setSuccessMessage(null); setError(null); }} 
                        className="text-sm font-semibold text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors flex items-center justify-center w-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        Back to Signup
                    </button>
                )}
            </div>
        </div>
        
        <p className="text-center text-white/80 mt-6 text-sm font-medium drop-shadow-md">
            &copy; {new Date().getFullYear()} {APP_TITLE}. Trusted by millions.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
