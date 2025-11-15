import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Stethoscope, LogOut, MapPin, Calendar, Clock, CheckCircle, Phone, Globe, GraduationCap, DollarSign, Edit2, Video, MessageSquare, X } from 'lucide-react';
import { Appointment } from '../../types';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { VideoCall } from './VideoCall';
import { AppointmentChat } from './AppointmentChat';
import { DoctorMap } from './DoctorMap';

export const DoctorDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [chattingAppointment, setChattingAppointment] = useState<Appointment | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

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

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        localStorage.setItem('doctor_profile_picture', base64String);
        setIsChangingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProfileDisplay = () => {
    if (profilePicture) {
      return <img src={profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />;
    }
    return profile?.full_name ? getInitials(profile.full_name) : 'DR';
  };

  useEffect(() => {
    const storedData = localStorage.getItem('medilink_doctor_data');
    const storedPicture = localStorage.getItem('doctor_profile_picture');
    
    if (storedData) {
      setDoctorData(JSON.parse(storedData));
    }
    if (storedPicture) {
      setProfilePicture(storedPicture);
    }

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patient_id: 'p1',
        doctor_id: profile?.id || '',
        appointment_date: new Date(Date.now() + 3600000).toISOString(),
        status: 'confirmed',
        consultation_mode: 'online',
        symptoms: 'Fever and headache',
        patient: {
          id: 'p1',
          full_name: 'Rahul Sharma',
          mobile_number: '9876543200',
          user_type: 'patient',
          preferred_language: 'hindi',
        },
      },
      {
        id: '2',
        patient_id: 'p2',
        doctor_id: profile?.id || '',
        appointment_date: new Date(Date.now() + 7200000).toISOString(),
        status: 'pending',
        consultation_mode: 'offline',
        symptoms: 'Stomach pain',
        patient: {
          id: 'p2',
          full_name: 'Priya Reddy',
          mobile_number: '9876543201',
          user_type: 'patient',
          preferred_language: 'kannada',
        },
      },
      {
        id: '3',
        patient_id: 'p3',
        doctor_id: profile?.id || '',
        appointment_date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        consultation_mode: 'online',
        symptoms: 'Back pain',
        diagnosis: 'Muscle strain - prescribed rest and physiotherapy',
        prescribed_medicines: ['Ibuprofen 400mg - after food - 5 days', 'Vitamin D3 - daily for 2 weeks'],
        patient: {
          id: 'p3',
          full_name: 'Amit Kumar',
          mobile_number: '9876543202',
          user_type: 'patient',
          preferred_language: 'english',
        },
      },
      {
        id: '4',
        patient_id: 'p4',
        doctor_id: profile?.id || '',
        appointment_date: new Date(Date.now() + 3 * 3600000).toISOString(),
        status: 'confirmed',
        consultation_mode: 'online',
        symptoms: 'Suspected bone fracture after fall',
        patient: {
          id: 'p4',
          full_name: 'Sunita Patil',
          mobile_number: '9876543203',
          user_type: 'patient',
          preferred_language: 'english',
        },
      },
      {
        id: '5',
        patient_id: 'p5',
        doctor_id: profile?.id || '',
        appointment_date: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'completed',
        consultation_mode: 'offline',
        symptoms: 'Shortness of breath and cough',
        diagnosis: 'Acute bronchitis - inhaler and rest advised',
        prescribed_medicines: ['Salbutamol inhaler - 2 puffs when needed', 'Ambroxol syrup 10ml - twice daily - 5 days'],
        patient: {
          id: 'p5',
          full_name: 'Imran Khan',
          mobile_number: '9876543204',
          user_type: 'patient',
          preferred_language: 'hindi',
        },
      },
    ];

    // Defer setting to next tick to avoid blocking first paint
    setTimeout(() => setAppointments(mockAppointments), 0);
  }, [profile]);

  const upcomingAppointments = useMemo(
    () => appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled'),
    [appointments]
  );
  const completedAppointments = useMemo(
    () => appointments.filter(a => a.status === 'completed'),
    [appointments]
  );

  // Simple pagination to reduce initial render cost
  const [upcomingLimit, setUpcomingLimit] = useState(10);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('app_name')} - Doctor Portal</h1>
                <p className="text-sm text-gray-600">Professional Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-right">
                <p className="text-sm text-gray-600">Dr.</p>
                <p className="font-semibold text-gray-800">{profile?.full_name}</p>
              </div>
              
              {/* Profile Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow-lg overflow-hidden">
                {getProfileDisplay()}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                {getProfileDisplay()}
              </div>
              <button
                onClick={() => setIsChangingPhoto(!isChangingPhoto)}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">Dr. {profile?.full_name || 'Doctor'}</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isAvailable
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isAvailable ? t('available') : t('not_available')}
                </div>
              </div>
              {doctorData && (
                <p className="text-gray-600 mb-4">{doctorData.medical_degree}</p>
              )}
              
              {isChangingPhoto && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {profilePicture && (
                    <button
                      onClick={() => {
                        setProfilePicture(null);
                        localStorage.removeItem('doctor_profile_picture');
                        setIsChangingPhoto(false);
                      }}
                      className="mt-2 w-full text-sm px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                  <button
                    onClick={() => setIsChangingPhoto(false)}
                    className="mt-2 w-full text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                {doctorData && (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Specialization</p>
                        <p className="font-semibold">{doctorData.specialization || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Consultation Fee</p>
                        <p className="font-semibold">₹{doctorData.consultation_fee || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="font-semibold">{profile?.mobile_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="font-semibold">{getPreferredLanguage()}</p>
                  </div>
                </div>
                {doctorData?.registration_number && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Registration</p>
                      <p className="font-semibold">{doctorData.registration_number}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Location</p>
                    <button type="button" className="font-semibold text-blue-700 hover:underline" onClick={() => setShowMapModal(true)}>
                      {doctorData?.location_address || 'Bangalore, Karnataka'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('availability')}</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-semibold">Status:</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  isAvailable
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isAvailable ? t('available') : t('not_available')}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Toggle your availability to let patients know if you're accepting appointments.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Today's Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Appointments:</span>
                <span className="text-2xl font-bold">{upcomingAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed:</span>
                <span className="text-2xl font-bold">{completedAppointments.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            MY UPCOMING APPOINTMENTS
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming appointments
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {upcomingAppointments.slice(0, upcomingLimit).map((appointment) => {
                  const { date, time } = formatDateTime(appointment.appointment_date);
                  return (
                    <div
                      key={appointment.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{appointment.patient?.full_name}</h3>
                          <p className="text-sm text-gray-600">Phone: {appointment.patient?.mobile_number}</p>
                          <p className="text-sm text-gray-600">Language: {appointment.patient?.preferred_language}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="capitalize">{appointment.consultation_mode}</span>
                        </div>
                      </div>

                      {appointment.symptoms && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Symptoms:</p>
                          <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                // Confirm appointment
                                setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'confirmed' as const } : a));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to reject this appointment?')) {
                                  // Reject appointment
                                  setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'cancelled' as const } : a));
                                }
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <>
                            {appointment.consultation_mode === 'online' && (
                              <button
                                onClick={() => setActiveConsultation(appointment)}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Video className="w-4 h-4" />
                                Start Video Call
                              </button>
                            )}
                            {appointment.consultation_mode === 'offline' && (
                              <button
                                onClick={() => setActiveConsultation(appointment)}
                                className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                              >
                                Start Consultation
                              </button>
                            )}
                          </>
                        )}
                        
                        <button 
                          onClick={() => setViewingAppointment(appointment)} 
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => setChattingAppointment(appointment)} 
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {upcomingAppointments.length > upcomingLimit && (
                <div className="pt-2">
                  <button
                    onClick={() => setUpcomingLimit(l => l + 10)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            {t('completed')} Consultations
          </h2>
          {completedAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed consultations yet
            </div>
          ) : (
            <div className="space-y-4">
              {completedAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.appointment_date);
                return (
                  <div
                    key={appointment.id}
                    className="border-2 border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{appointment.patient?.full_name}</h3>
                        <p className="text-sm text-gray-600">{date} at {time}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Completed
                      </div>
                    </div>
                    {appointment.diagnosis && (
                      <div className="bg-green-50 rounded-lg p-3 mt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Diagnosis:</p>
                        <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                      </div>
                    )}
                    {appointment.prescribed_medicines && appointment.prescribed_medicines.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Prescribed Medicines:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {appointment.prescribed_medicines.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {/* Consultation Modal with Video Call */}
      {activeConsultation && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="w-full h-full relative">
            <VideoCall
              patientName={activeConsultation.patient?.full_name || 'Patient'}
              onEndCall={() => setActiveConsultation(null)}
            />
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
              <button onClick={() => setViewingAppointment(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Patient:</span> {viewingAppointment.patient?.full_name}</p>
              <p><span className="font-semibold">Phone:</span> {viewingAppointment.patient?.mobile_number}</p>
              <p><span className="font-semibold">Mode:</span> {viewingAppointment.consultation_mode}</p>
              <p><span className="font-semibold">Symptoms:</span> {viewingAppointment.symptoms || '-'}</p>
              <p><span className="font-semibold">Status:</span> {viewingAppointment.status}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setViewingAppointment(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Close</button>
              <button onClick={() => { setActiveConsultation(viewingAppointment); setViewingAppointment(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Start Consultation</button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Chat */}
      {chattingAppointment && (
        <AppointmentChat
          appointment={chattingAppointment}
          isOpen={true}
          onClose={() => setChattingAppointment(null)}
        />
      )}

      {showMapModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Doctor Location</h3>
              <button onClick={() => setShowMapModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
            </div>
            <DoctorMap doctor={{
              ...profile,
              ...doctorData,
              current_location: doctorData?.current_location || { lat: 12.9716, lng: 77.5946 },
              location_address: doctorData?.location_address || 'Bangalore, Karnataka',
              full_name: profile?.full_name || 'Doctor'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};
