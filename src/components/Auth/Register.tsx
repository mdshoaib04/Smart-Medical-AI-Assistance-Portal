import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserType } from '../../types';
import { UserPlus, Stethoscope, User, AlertCircle } from 'lucide-react';

export const Register: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<UserType>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [medicalDegree, setMedicalDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMockAuth, setUseMockAuth] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setUseMockAuth(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (userType === 'doctor') {
      if (!medicalDegree.trim()) {
        setError('Please enter your medical degree');
        return;
      }
      if (!specialization.trim()) {
        setError('Please enter your specialization');
        return;
      }
      if (!registrationNumber.trim()) {
        setError('Please enter your registration number');
        return;
      }
      if (!consultationFee || parseInt(consultationFee) < 0) {
        setError('Please enter a valid consultation fee');
        return;
      }
    }

    setLoading(true);
    console.log('[Register] Starting registration for:', email);

    try {
      // Set a timeout to force complete if taking too long
      const timeoutId = setTimeout(() => {
        console.warn('[Register] Registration timeout - forcing complete');
        setLoading(false);
      }, 3000); // 3 second timeout

      await signUp(fullName, email, password, userType);
      
      clearTimeout(timeoutId);
      console.log('[Register] Registration completed successfully');

      if (userType === 'doctor') {
        const doctorData = {
          medical_degree: medicalDegree,
          specialization,
          consultation_fee: parseInt(consultationFee),
          registration_number: registrationNumber,
        };
        localStorage.setItem('medilink_doctor_data', JSON.stringify(doctorData));
      }
      
      // Clear form on success
      setFullName('');
      setEmail('');
      setPassword('');
      setLoading(false);
    } catch (err: any) {
      console.error('[Register] Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="w-12 h-12 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{t('register')}</h2>
        <p className="text-gray-600 mt-2">Create your MediLink account</p>
      </div>

      {useMockAuth && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> Using local authentication. Your account will be stored locally in your browser.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setUserType('patient')}
          className={`flex-1 py-4 rounded-lg border-2 transition-all ${
            userType === 'patient'
              ? 'border-teal-600 bg-teal-50 text-teal-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <User className="w-6 h-6 mx-auto mb-2" />
          <div className="font-semibold">{t('patient')}</div>
        </button>
        <button
          type="button"
          onClick={() => setUserType('doctor')}
          className={`flex-1 py-4 rounded-lg border-2 transition-all ${
            userType === 'doctor'
              ? 'border-teal-600 bg-teal-50 text-teal-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <Stethoscope className="w-6 h-6 mx-auto mb-2" />
          <div className="font-semibold">{t('doctor')}</div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('full_name')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
            minLength={6}
          />
        </div>

        {userType === 'doctor' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('medical_degree')}
                </label>
                <input
                  type="text"
                  value={medicalDegree}
                  onChange={(e) => setMedicalDegree(e.target.value)}
                  placeholder="e.g., MBBS, MD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('specialization')}
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Cardiologist"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g., KMC/2025/123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('consultation_fee')}
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="Amount in ₹"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : t('register')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-600 font-semibold hover:underline"
          >
            {t('login')}
          </button>
        </p>
      </div>
    </div>
  );
};
