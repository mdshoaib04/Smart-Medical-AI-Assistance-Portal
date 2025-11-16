import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SymptomChecker } from './SymptomChecker';
import { DoctorFinder } from './DoctorFinder';
import { EmergencySection } from './EmergencySection';
import { MedicalRecords } from './MedicalRecords';
import { Activity, LogOut, User, Phone, Globe, Calendar, Edit2, Save, X, Mail, Home, Brain, AlertCircle as AlertIcon, Stethoscope } from 'lucide-react';
import { Appointment } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'symptoms' | 'doctors'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [showAmbulancePopup, setShowAmbulancePopup] = useState(false);
  const [showBloodDonors, setShowBloodDonors] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice command for emergency
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Voice command:', transcript);
      
      // Check for emergency keywords in English and Hindi
      const emergencyKeywords = ['help', 'emergency', 'ambulance', 'मदद', 'बचाओ', 'एम्बुलेंस'];
      const hasEmergencyWord = emergencyKeywords.some(keyword => transcript.includes(keyword));
      
      if (hasEmergencyWord) {
        console.log('Emergency detected! Booking ambulance...');
        setSelectedEmergency('voice-emergency');
        setShowAmbulancePopup(true);
        
        // Play alert sound and show notification
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwF');
          audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
          console.log('Audio not supported');
        }
        
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Restart if still listening
      }
    };

    // Start listening
    try {
      recognition.start();
      setIsListening(true);
      console.log('Voice emergency detection started');
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }

    return () => {
      setIsListening(false);
      recognition.stop();
    };
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [patientAge, setPatientAge] = useState('28');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [email, setEmail] = useState('patient@example.com');
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'Family Member',
    phone: '9876543299'
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load saved data from localStorage
    const storedAge = localStorage.getItem('patient_age');
    const storedBloodGroup = localStorage.getItem('blood_group');
    const storedEmail = localStorage.getItem('patient_email');
    const storedEmergency = localStorage.getItem('emergency_contact');
    const storedPicture = localStorage.getItem('patient_profile_picture');
    
    if (storedAge) setPatientAge(storedAge);
    if (storedBloodGroup) setBloodGroup(storedBloodGroup);
    if (storedEmail) setEmail(storedEmail);
    if (storedPicture) setProfilePicture(storedPicture);
    if (storedEmergency) {
      try {
        setEmergencyContact(JSON.parse(storedEmergency));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const key = `patient_appointments_${profile?.id || 'patient-1'}`;
    const loadAppointments = () => {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setAppointments([]);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as Appointment[];
        // Sort upcoming first by date
        const sorted = parsed.slice().sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
        setAppointments(sorted);
      } catch {}
    };
    loadAppointments();

    const handleNew = (e: Event) => {
      // On any created event, reload
      loadAppointments();
    };
    window.addEventListener('appointment_created', handleNew);
    window.addEventListener('storage', loadAppointments);
    return () => {
      window.removeEventListener('appointment_created', handleNew);
      window.removeEventListener('storage', loadAppointments);
    };
  }, [profile?.id]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setIsProfileOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPreferredLanguage = () => {
    const langMap: Record<string, string> = {
      english: '🇬🇧 English',
      hindi: '🇮🇳 Hindi',
      kannada: '🇮🇳 Kannada'
    };
    return langMap[profile?.preferred_language || 'english'] || '🇬🇧 English';
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setIsProfileOpen(false);
    // Here you would typically save to a backend or localStorage
    localStorage.setItem('patient_age', patientAge);
    localStorage.setItem('blood_group', bloodGroup);
    localStorage.setItem('patient_email', email);
    localStorage.setItem('emergency_contact', JSON.stringify(emergencyContact));
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        localStorage.setItem('patient_profile_picture', base64String);
        setIsChangingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProfileDisplay = () => {
    if (profilePicture) {
      return <img src={profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />;
    }
    return profile?.full_name ? getInitials(profile.full_name) : 'P';
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to stored values
    const storedAge = localStorage.getItem('patient_age');
    const storedBloodGroup = localStorage.getItem('blood_group');
    const storedEmail = localStorage.getItem('patient_email');
    const storedEmergency = localStorage.getItem('emergency_contact');
    if (storedAge) setPatientAge(storedAge);
    if (storedBloodGroup) setBloodGroup(storedBloodGroup);
    if (storedEmail) setEmail(storedEmail);
    if (storedEmergency) {
      try {
        setEmergencyContact(JSON.parse(storedEmergency));
      } catch {}
    }
  };

  const upcoming = appointments.filter(a => new Date(a.appointment_date).getTime() >= Date.now());
  const past = appointments.filter(a => new Date(a.appointment_date).getTime() < Date.now());

  const emergencyConditions = [
    { id: 'heart', name: 'Heart Attack', icon: '❤️', color: 'bg-red-100 border-red-300 text-red-800' },
    { id: 'accident', name: 'Accident/Injury', icon: '🚑', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { id: 'stroke', name: 'Stroke', icon: '🧠', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { id: 'breathing', name: 'Breathing Problem', icon: '🫁', color: 'bg-blue-100 border-blue-300 text-blue-800' }
  ];

  const bloodDonors = [
    { id: 1, name: 'Rajesh Kumar', bloodGroup: 'O+', phone: '9876543210', location: 'Koramangala, Bangalore', available: true },
    { id: 2, name: 'Priya Sharma', bloodGroup: 'A+', phone: '9876543211', location: 'Indiranagar, Bangalore', available: true },
    { id: 3, name: 'Amit Patel', bloodGroup: 'B+', phone: '9876543212', location: 'Whitefield, Bangalore', available: false },
    { id: 4, name: 'Sneha Reddy', bloodGroup: 'AB+', phone: '9876543213', location: 'HSR Layout, Bangalore', available: true },
    { id: 5, name: 'Vikram Singh', bloodGroup: 'O-', phone: '9876543214', location: 'Jayanagar, Bangalore', available: true },
    { id: 6, name: 'Ananya Iyer', bloodGroup: 'A-', phone: '9876543215', location: 'Malleshwaram, Bangalore', available: true },
  ];

  const handleEmergencySelect = (emergencyId: string) => {
    setSelectedEmergency(emergencyId);
  };

  const handleBookAmbulance = () => {
    setShowAmbulancePopup(true);
  };

  const handleAmbulanceConfirm = () => {
    setShowAmbulancePopup(false);
    setShowBloodDonors(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Emergency Section */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertIcon className="w-8 h-8 text-red-600 animate-pulse" />
                  <h2 className="text-2xl font-bold text-red-800">Emergency Services</h2>
                </div>
              </div>

              <p className="text-gray-700 mb-4">Select your emergency condition or use voice command:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {emergencyConditions.map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => handleEmergencySelect(condition.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedEmergency === condition.id 
                        ? condition.color + ' ring-2 ring-offset-2 ring-red-500'
                        : 'bg-white border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{condition.icon}</div>
                    <p className="font-semibold text-sm">{condition.name}</p>
                  </button>
                ))}
              </div>

              {selectedEmergency && (
                <button
                  onClick={handleBookAmbulance}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <Stethoscope className="w-6 h-6" />
                  Book Ambulance
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <Phone className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Emergency</p>
                  <p className="text-lg font-bold text-red-600">108</p>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <Phone className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Ambulance</p>
                  <p className="text-lg font-bold text-red-600">102</p>
                </div>
              </div>
            </div>

            {/* Blood Donors Section */}
            {showBloodDonors && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    🩸 Blood Donors
                  </h2>
                  <button
                    onClick={() => setShowBloodDonors(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bloodDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className={`border-2 rounded-lg p-4 ${
                        donor.available 
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{donor.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <span className="text-2xl">🩸</span>
                            <span className="font-semibold text-red-600">{donor.bloodGroup}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">📍 {donor.location}</p>
                        </div>
                        {donor.available && (
                          <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      
                      {donor.available && (
                        <a
                          href={`tel:${donor.phone}`}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Call {donor.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointment History / Upcoming */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">Upcoming: {upcoming.length}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">Past: {past.length}</span>
                </div>
              </div>
              {appointments.length === 0 ? (
                <p className="text-gray-600">No appointments yet. Book one from the Doctors tab.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {upcoming.length === 0 ? (
                        <p className="text-sm text-gray-500">No upcoming appointments</p>
                      ) : (
                        upcoming.map((apt) => (
                          <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{apt.doctor?.full_name || apt.doctor_id}</p>
                                <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                                <p className="text-xs text-gray-500 mt-1">Fee: ₹{apt.doctor?.consultation_fee || 'N/A'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-800 font-medium">{formatDate(apt.appointment_date)}</p>
                                <p className="text-xs text-gray-600 capitalize">{apt.consultation_mode}</p>
                                {apt.status === 'cancelled' ? (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    Appointment Cancelled
                                  </span>
                                ) : (
                                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {apt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {apt.symptoms && (
                              <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                <span className="font-medium">Symptoms:</span> {apt.symptoms}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this appointment?')) {
                                    const updatedAppointments = appointments.map(a => 
                                      a.id === apt.id ? { ...a, status: 'cancelled' as const } : a
                                    );
                                    setAppointments(updatedAppointments);
                                    const key = `patient_appointments_${profile?.id || 'patient-1'}`;
                                    localStorage.setItem(key, JSON.stringify(updatedAppointments));
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Past</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {past.length === 0 ? (
                        <p className="text-sm text-gray-500">No past appointments</p>
                      ) : (
                        past.map((apt) => (
                          <div key={apt.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{apt.doctor?.full_name || apt.doctor_id}</p>
                              <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-800">{formatDate(apt.appointment_date)}</p>
                              <p className="text-xs text-gray-600 capitalize">{apt.consultation_mode}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Completed</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <MedicalRecords />
            </div>
          </>
        );
      case 'symptoms':
        return <SymptomChecker />;
      case 'doctors':
        return <DoctorFinder />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('app_name')}</h1>
                <p className="text-sm text-gray-600">{t('tagline')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-800">{profile?.full_name}</p>
              </div>
              
              {/* Profile Icon */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
                >
                  {getProfileDisplay()}
                </button>
                
                {/* Profile Dropdown Modal */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-96 bg-white rounded-xl shadow-2xl p-6 z-50 border border-gray-200 profile-dropdown">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Patient Profile</h3>
                      <button
                        onClick={() => setIsProfileOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center mb-4 pb-4 border-b">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 overflow-hidden">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            profile?.full_name ? getInitials(profile.full_name) : 'P'
                          )}
                        </div>
                        <button
                          onClick={() => setIsChangingPhoto(!isChangingPhoto)}
                          className="absolute bottom-3 right-0 bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{profile?.full_name || 'Patient'}</h3>
                      <p className="text-sm text-gray-600">Patient Account</p>
                      
                      {isChangingPhoto && (
                        <div className="mt-3 w-full space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
                          />
                          {profilePicture && (
                            <button
                              onClick={() => {
                                setProfilePicture(null);
                                localStorage.removeItem('patient_profile_picture');
                                setIsChangingPhoto(false);
                              }}
                              className="w-full text-sm px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Remove Photo
                            </button>
                          )}
                          <button
                            onClick={() => setIsChangingPhoto(false)}
                            className="w-full text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {!isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-semibold text-gray-800">{patientAge} years</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                          <span className="text-xl">🩸</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Blood Group</p>
                            <p className="font-semibold text-gray-800">{bloodGroup}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Mobile</p>
                            <p className="font-semibold text-gray-800">{profile?.mobile_number || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <Mail className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800 text-sm">{email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Globe className="w-5 h-5 text-orange-600" />
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Language</label>
                            <select
                              value={profile?.preferred_language || 'english'}
                              onChange={(e) => {
                                // Assuming setLanguage is available from useLanguage context
                                // and profile can be updated. For now, just log.
                                console.log('Language changed to:', e.target.value);
                                // In a real app, you'd update the user's profile in the backend
                                // and then update the local profile state.
                                // For this task, we'll just update localStorage and reload.
                                localStorage.setItem('medilink_language', e.target.value);
                                window.location.reload(); // Force reload to apply language change
                              }}
                              className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-800 font-semibold bg-white"
                            >
                              <option value="english">🇬🇧 English</option>
                              <option value="hindi">🇮🇳 Hindi</option>
                              <option value="kannada">🇮🇳 Kannada</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs font-semibold text-red-800 mb-2">Emergency Contact</p>
                          <p className="text-sm text-gray-700"><span className="font-semibold">Name:</span> {emergencyContact.name}</p>
                          <p className="text-sm text-gray-700"><span className="font-semibold">Phone:</span> {emergencyContact.phone}</p>
                        </div>
                        
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                          <input
                            type="number"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                          <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {renderContent()}
      </main>

      {/* Ambulance Popup */}
      {showAmbulancePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in">
            <div className="text-center">
              <div className="mb-4">
                {selectedEmergency === 'voice-emergency' && (
                  <div className="mb-4 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
                    <p className="text-sm font-semibold text-purple-800">
                      🎙️ Voice Command Detected
                    </p>
                  </div>
                )}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Stethoscope className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ambulance Booked!</h3>
                <p className="text-green-600 font-semibold text-lg mb-4">
                  ✅ Your ambulance is on the way
                </p>
                <p className="text-gray-600 mb-2">Expected arrival time:</p>
                <p className="text-3xl font-bold text-teal-600 mb-4">8-10 mins</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Driver:</strong> Ramesh Kumar<br />
                    <strong>Vehicle:</strong> KA-01-AB-1234<br />
                    <strong>Contact:</strong> 9876543210
                  </p>
                </div>
              </div>
              <button
                onClick={handleAmbulanceConfirm}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Similar to Blinkit */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-3 px-6 transition-all ${
                activeTab === 'home'
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className={`w-6 h-6 mb-1 ${
                activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'
              }`} />
              <span className={`text-xs ${
                activeTab === 'home' ? 'font-semibold' : 'font-medium'
              }`}>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('symptoms')}
              className={`flex flex-col items-center py-3 px-6 transition-all ${
                activeTab === 'symptoms'
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className={`w-6 h-6 mb-1 ${
                activeTab === 'symptoms' ? 'stroke-[2.5]' : 'stroke-2'
              }`} />
              <span className={`text-xs ${
                activeTab === 'symptoms' ? 'font-semibold' : 'font-medium'
              }`}>AI Symptoms</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex flex-col items-center py-3 px-6 transition-all ${
                activeTab === 'doctors'
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Stethoscope className={`w-6 h-6 mb-1 ${
                activeTab === 'doctors' ? 'stroke-[2.5]' : 'stroke-2'
              }`} />
              <span className={`text-xs ${
                activeTab === 'doctors' ? 'font-semibold' : 'font-medium'
              }`}>Doctors</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};
