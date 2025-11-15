import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserType } from '../../types';
import { LogIn } from 'lucide-react';

export const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('patient');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password, userType);
      // Success - the AuthContext will handle navigation
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-scale-in language-transition">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <LogIn className="w-12 h-12 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{t('login')}</h2>
        <p className="text-gray-600 mt-2">{t('welcome')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUserType('patient')}
            className={`flex-1 py-2 rounded-lg border-2 transition-all ${
              userType === 'patient'
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {t('patient')}
          </button>
          <button
            type="button"
            onClick={() => setUserType('doctor')}
            className={`flex-1 py-2 rounded-lg border-2 transition-all ${
              userType === 'doctor'
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {t('doctor')}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('enter_password')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105"
        >
          {loading ? t('logging_in') : t('login')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t('dont_have_account')}{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-teal-600 font-semibold hover:underline"
          >
            {t('register')}
          </button>
        </p>
      </div>
    </div>
  );
};
