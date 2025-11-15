import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthScreen } from './components/AuthScreen';
import { PatientDashboard } from './components/Patient/PatientDashboard';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';
import { Loader } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold animate-pulse">{t('loading_medilink')}</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  if (profile.user_type === 'patient') {
    return <PatientDashboard />;
  }

  if (profile.user_type === 'doctor') {
    return <DoctorDashboard />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
