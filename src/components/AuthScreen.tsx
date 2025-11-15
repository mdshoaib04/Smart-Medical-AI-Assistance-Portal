import React, { useState } from 'react';
import { Login } from './Auth/Login';
import { Register } from './Auth/Register';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { Activity, Heart, Shield, Zap } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { t } = useLanguage();
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-blue-500 to-blue-600 flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8 animate-slide-down language-transition">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-16 h-16 text-white drop-shadow-lg" />
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">{t('app_name')}</h1>
            </div>
            <p className="text-2xl text-white font-semibold drop-shadow-md mb-8">{t('tagline')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8 animate-slide-up language-transition">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white hover-lift">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">{t('ai_powered_diagnosis')}</h3>
                <p className="text-sm">{t('diseases_detection')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white hover-lift">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">{t('secure_private')}</h3>
                <p className="text-sm">{t('end_to_end_encryption')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white hover-lift">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">{t('emergency_services')}</h3>
                <p className="text-sm">{t('ambulance_24_7')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            {showLogin ? (
              <Login onSwitchToRegister={() => setShowLogin(false)} />
            ) : (
              <Register onSwitchToLogin={() => setShowLogin(true)} />
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-white text-sm">
        <p className="language-transition">{t('copyright')}</p>
        <p className="mt-2 text-xs opacity-80">
        DEVELOPED BY BHARATESH BCA STUDENTS :- MEGHARAJ UPADHYE & SUCHITA MADIWALAR.
        </p>
      </footer>
    </div>
  );
};
