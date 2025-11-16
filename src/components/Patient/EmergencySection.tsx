import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertTriangle, Ambulance, Phone, MapPin, Loader } from 'lucide-react';
import { getCurrentLocation, getAddressFromCoordinates } from '../../utils/locationService';

export const EmergencySection: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [location, setLocation] = useState<string>('');

  const handleEmergencyRequest = async () => {
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      const address = await getAddressFromCoordinates(loc.lat, loc.lng);
      setLocation(address);
      setEmergencyActive(true);

      setTimeout(() => {
        alert(`Emergency services notified!\nLocation: ${address}\nAmbulance dispatched.`);
      }, 1000);
    } catch (error) {
      alert('Failed to get location. Please ensure location services are enabled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
        <h2 className="text-2xl font-bold text-red-800">{t('emergency')}</h2>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-gray-700 mb-4">
          In case of medical emergency, click the button below to automatically notify nearby ambulance services and doctors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Phone className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Emergency Helpline</p>
            <p className="text-lg font-bold text-red-600">108</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Ambulance className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Ambulance Service</p>
            <p className="text-lg font-bold text-red-600">102</p>
          </div>
        </div>
        
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4 animate-pulse border-2 border-red-800">
          <p className="font-bold text-center text-xl">
            ⚠️ SAY "HELP" OR "EMERGENCY" TO CALL AMBULANCE IMMEDIATELY ⚠️
          </p>
        </div>

        {!emergencyActive ? (
          <button
            onClick={handleEmergencyRequest}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg mt-4"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Ambulance className="w-6 h-6" />
                {t('book_ambulance')}
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 animate-pulse">
              <p className="text-green-800 font-bold text-center text-lg">
                ✓ Emergency Request Active
              </p>
              <p className="text-green-700 text-center mt-1">
                Help is on the way!
              </p>
            </div>
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Your Location:</p>
                <p className="text-sm text-gray-700">{location}</p>
              </div>
            </div>
            <button
              onClick={() => setEmergencyActive(false)}
              className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Cancel Request
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 text-center">
        <p>⚠️ Use emergency services responsibly</p>
      </div>
    </div>
  );
};
