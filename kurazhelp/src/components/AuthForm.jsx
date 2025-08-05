// src/components/AuthForm.jsx
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import kuraztechLogo from '../assets/kuraztech-logo.png';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// This component now accepts an `initialMode` prop to know whether to show
// the login or signup form.
function AuthForm({ initialMode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(initialMode === 'login'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // New state for password validation
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  // New function to validate password strength
  const validatePassword = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordCriteria(criteria);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!isLogin) {
      validatePassword(newPassword);
    }
  };

  // Check if all criteria are met
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!isLogin && !isPasswordStrong) {
      setError('Password does not meet all strength requirements.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up successfully!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already in use. Try logging in.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters long.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setLoading(true);
    setResetMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('A password reset link has been sent to your email.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('Signed in with Google!');
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordCriteria = () => (
    <ul className="text-sm mt-2 space-y-1">
      <li className={`flex items-center ${passwordCriteria.length ? 'text-green-400' : 'text-gray-400'}`}>
        {passwordCriteria.length ? <CheckCircleIcon className="h-4 w-4 mr-2" /> : <XCircleIcon className="h-4 w-4 mr-2" />}
        At least 8 characters
      </li>
      <li className={`flex items-center ${passwordCriteria.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
        {passwordCriteria.uppercase ? <CheckCircleIcon className="h-4 w-4 mr-2" /> : <XCircleIcon className="h-4 w-4 mr-2" />}
        An uppercase letter (A-Z)
      </li>
      <li className={`flex items-center ${passwordCriteria.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
        {passwordCriteria.lowercase ? <CheckCircleIcon className="h-4 w-4 mr-2" /> : <XCircleIcon className="h-4 w-4 mr-2" />}
        A lowercase letter (a-z)
      </li>
      <li className={`flex items-center ${passwordCriteria.number ? 'text-green-400' : 'text-gray-400'}`}>
        {passwordCriteria.number ? <CheckCircleIcon className="h-4 w-4 mr-2" /> : <XCircleIcon className="h-4 w-4 mr-2" />}
        A number (0-9)
      </li>
      <li className={`flex items-center ${passwordCriteria.symbol ? 'text-green-400' : 'text-gray-400'}`}>
        {passwordCriteria.symbol ? <CheckCircleIcon className="h-4 w-4 mr-2" /> : <XCircleIcon className="h-4 w-4 mr-2" />}
        A special character (!@#$...)
      </li>
    </ul>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={kuraztechLogo} alt="KurazTech Logo" className="h-12" />
        </div>
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          {isLogin ? 'Welcome Back!' : 'Join KurazHelp'}
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          {isLogin ? 'Login to continue to your documents.' : 'Sign up to create and manage your documents.'}
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {resetMessage && <p className="text-green-500 text-center mb-4">{resetMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="your@example.com"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="********"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-400 hover:text-gray-200"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.054 10.054 0 0112 19c-4.418 0-8-3.582-8-8a8.083 8.083 0 011.175-4.575m4.65 9.075a.998.998 0 01-1.414 0c-.39-.39-1.024-.39-1.414 0-.39.39-.39 1.024 0 1.414.39.39 1.024.39 1.414 0a.998.998 0 010-1.414zM12 14a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {!isLogin && password && renderPasswordCriteria()}
          {isLogin && (
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-yellow-400 text-sm hover:underline"
            >
              Forgot Password?
            </button>
          )}
          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            disabled={loading || (!isLogin && !isPasswordStrong)}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-500">
                Or
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition duration-200"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>

          {/* New navigation button to go back to the Welcome Page */}
          <div className="text-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-gray-400 text-sm hover:underline"
            >
              Go Back
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="https://kuraztech.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="https://kuraztech.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;