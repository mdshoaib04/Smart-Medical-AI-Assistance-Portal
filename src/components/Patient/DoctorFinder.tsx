import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Doctor } from '../../types';
// AI recommendations come from SymptomChecker via localStorage
import { saveAllDoctors } from '../../utils/doctorRepository';
import { DoctorMap } from './DoctorMap';
import { ChatInterface } from '../Chat/ChatInterface';
import { EnhancedAppointmentBooking } from './EnhancedAppointmentBooking';
import { createAppointmentNotification } from '../../utils/notificationService';
import { useAuth } from '../../contexts/AuthContext';

export const DoctorFinder: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  // loading retained in loadDoctors but not displayed in names-only mode
  // loading not displayed in names-only mode
  const [recommendedSpecs, setRecommendedSpecs] = useState<string[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [showMap, setShowMap] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<string | null>(null);
  const [appointmentMode, setAppointmentMode] = useState<'online' | 'offline'>('offline');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const [errors, setErrors] = useState<{ name?: string; age?: string; phone?: string }>(() => ({}));

  useEffect(() => {
    loadDoctors();
    // Load AI recommendations from SymptomChecker
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = () => {
    // Get AI recommendations from localStorage (set by SymptomChecker)
    const recommendedList = localStorage.getItem('medilink_recommended_specializations');
    const recommended = localStorage.getItem('medilink_recommended_specialization');
    
    if (recommendedList) {
      try {
        const parsed = JSON.parse(recommendedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecommendedSpecs(parsed);
        }
      } catch {}
    } else if (recommended) {
      setRecommendedSpecs([recommended]);
    }
  };

  const loadDoctors = () => {
    const mockDoctors: Doctor[] = [
      {
        id: '1',
        full_name: 'Dr. Rajesh Kumar',
        mobile_number: '9876543210',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD',
        specialization: 'Cardiologist',
        consultation_fee: 500,
        current_location: { lat: 12.9716, lng: 77.5946 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.5,
        total_consultations: 1250,
      },
      {
        id: '2',
        full_name: 'Dr. Priya Sharma',
        mobile_number: '9876543211',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MS',
        specialization: 'General Physician',
        consultation_fee: 300,
        current_location: { lat: 12.9716, lng: 77.5946 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.8,
        total_consultations: 980,
      },
      {
        id: '3',
        full_name: 'Dr. Suresh Reddy',
        mobile_number: '9876543212',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD',
        specialization: 'Dermatologist',
        consultation_fee: 400,
        current_location: { lat: 12.9716, lng: 77.5946 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.3,
        total_consultations: 756,
      },
      {
        id: '4',
        full_name: 'Dr. Anita Verma',
        mobile_number: '9876543213',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD',
        specialization: 'Pediatrician',
        consultation_fee: 350,
        current_location: { lat: 12.9716, lng: 77.5946 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.9,
        total_consultations: 1450,
      },
      // Orthopedics / Trauma for fractures
      {
        id: '5',
        full_name: 'Dr. Neha Agarwal',
        mobile_number: '9876543214',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MS (Ortho)',
        specialization: 'Orthopedist',
        consultation_fee: 600,
        current_location: { lat: 12.982, lng: 77.59 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.7,
        total_consultations: 1100,
      },
      {
        id: '6',
        full_name: 'Dr. Arjun Mehta',
        mobile_number: '9876543215',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MS (General Surgery)',
        specialization: 'Trauma Surgeon',
        consultation_fee: 700,
        current_location: { lat: 12.965, lng: 77.6 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 890,
      },
      // Pulmonologist
      {
        id: '7',
        full_name: 'Dr. Kavya Iyer',
        mobile_number: '9876543216',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD (Pulmonology)',
        specialization: 'Pulmonologist',
        consultation_fee: 500,
        current_location: { lat: 12.97, lng: 77.61 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.4,
        total_consultations: 640,
      },
      // Gastroenterologist
      {
        id: '8',
        full_name: 'Dr. Mohan Rao',
        mobile_number: '9876543217',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, DM (Gastro)',
        specialization: 'Gastroenterologist',
        consultation_fee: 650,
        current_location: { lat: 12.969, lng: 77.597 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.5,
        total_consultations: 1020,
      },
      // Additional Cardiologists
      {
        id: '9',
        full_name: 'Dr. Vikram Singh',
        mobile_number: '9876543218',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MD, DM (Cardiology)',
        specialization: 'Cardiologist',
        consultation_fee: 550,
        current_location: { lat: 12.972, lng: 77.595 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1380,
      },
      {
        id: '10',
        full_name: 'Dr. Anjali Menon',
        mobile_number: '9876543219',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD (Cardiology)',
        specialization: 'Cardiologist',
        consultation_fee: 600,
        current_location: { lat: 12.968, lng: 77.593 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.9,
        total_consultations: 1580,
      },
      {
        id: '11',
        full_name: 'Dr. Ramesh Iyer',
        mobile_number: '9876543220',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD, FACC',
        specialization: 'Cardiologist',
        consultation_fee: 650,
        current_location: { lat: 12.974, lng: 77.592 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.7,
        total_consultations: 1120,
      },
      {
        id: '12',
        full_name: 'Dr. Shalini Gupta',
        mobile_number: '9876543221',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, DM (Cardiology)',
        specialization: 'Cardiologist',
        consultation_fee: 580,
        current_location: { lat: 12.970, lng: 77.598 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.8,
        total_consultations: 1350,
      },
      {
        id: '13',
        full_name: 'Dr. Kishore Reddy',
        mobile_number: '9876543222',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD',
        specialization: 'Cardiologist',
        consultation_fee: 500,
        current_location: { lat: 12.973, lng: 77.596 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.5,
        total_consultations: 980,
      },
      // Additional General Physicians
      {
        id: '14',
        full_name: 'Dr. Manoj Kumar',
        mobile_number: '9876543223',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MD',
        specialization: 'General Physician',
        consultation_fee: 350,
        current_location: { lat: 12.975, lng: 77.594 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1100,
      },
      {
        id: '15',
        full_name: 'Dr. Lakshmi Nair',
        mobile_number: '9876543224',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD (Internal Medicine)',
        specialization: 'General Physician',
        consultation_fee: 400,
        current_location: { lat: 12.967, lng: 77.592 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.4,
        total_consultations: 890,
      },
      {
        id: '16',
        full_name: 'Dr. Naveen Shetty',
        mobile_number: '9876543225',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, DNB',
        specialization: 'General Physician',
        consultation_fee: 300,
        current_location: { lat: 12.976, lng: 77.593 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.3,
        total_consultations: 720,
      },
      // Additional Dermatologists
      {
        id: '17',
        full_name: 'Dr. Deepika Mehra',
        mobile_number: '9876543226',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD (Dermatology)',
        specialization: 'Dermatologist',
        consultation_fee: 450,
        current_location: { lat: 12.974, lng: 77.599 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1150,
      },
      {
        id: '18',
        full_name: 'Dr. Venkat Swamy',
        mobile_number: '9876543227',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, DVD',
        specialization: 'Dermatologist',
        consultation_fee: 380,
        current_location: { lat: 12.968, lng: 77.595 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.5,
        total_consultations: 980,
      },
      // Additional Pulmonologists
      {
        id: '19',
        full_name: 'Dr. Ravi Verma',
        mobile_number: '9876543228',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MD (Pulmonology)',
        specialization: 'Pulmonologist',
        consultation_fee: 550,
        current_location: { lat: 12.972, lng: 77.597 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1250,
      },
      {
        id: '20',
        full_name: 'Dr. Meera Joshi',
        mobile_number: '9876543229',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, DNB (Pulmonology)',
        specialization: 'Pulmonologist',
        consultation_fee: 520,
        current_location: { lat: 12.969, lng: 77.594 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.7,
        total_consultations: 1420,
      },
      // Additional Gastroenterologists
      {
        id: '21',
        full_name: 'Dr. Ashok Desai',
        mobile_number: '9876543230',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, DM (Gastroenterology)',
        specialization: 'Gastroenterologist',
        consultation_fee: 680,
        current_location: { lat: 12.973, lng: 77.591 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.8,
        total_consultations: 1320,
      },
      {
        id: '22',
        full_name: 'Dr. Swati Bansal',
        mobile_number: '9876543231',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MD (Gastro)',
        specialization: 'Gastroenterologist',
        consultation_fee: 620,
        current_location: { lat: 12.970, lng: 77.599 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.6,
        total_consultations: 1080,
      },
      // Neurologist (for headaches/migraines)
      {
        id: '23',
        full_name: 'Dr. Subhash Reddy',
        mobile_number: '9876543232',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD, DM (Neurology)',
        specialization: 'Neurologist',
        consultation_fee: 700,
        current_location: { lat: 12.971, lng: 77.593 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.7,
        total_consultations: 1180,
      },
      {
        id: '24',
        full_name: 'Dr. Kavita Deshmukh',
        mobile_number: '9876543233',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MD (Neurology)',
        specialization: 'Neurologist',
        consultation_fee: 680,
        current_location: { lat: 12.975, lng: 77.596 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.9,
        total_consultations: 1480,
      },
      // Additional Pediatricians
      {
        id: '25',
        full_name: 'Dr. Arvind Patil',
        mobile_number: '9876543234',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, MD (Pediatrics)',
        specialization: 'Pediatrician',
        consultation_fee: 400,
        current_location: { lat: 12.974, lng: 77.592 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1120,
      },
      {
        id: '26',
        full_name: 'Dr. Smita Agarwal',
        mobile_number: '9876543235',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, DNB (Pediatrics)',
        specialization: 'Pediatrician',
        consultation_fee: 380,
        current_location: { lat: 12.972, lng: 77.598 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.8,
        total_consultations: 1350,
      },
      // Orthopedists
      {
        id: '27',
        full_name: 'Dr. Jayesh Mehta',
        mobile_number: '9876543236',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MS (Ortho)',
        specialization: 'Orthopedist',
        consultation_fee: 650,
        current_location: { lat: 12.968, lng: 77.594 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.7,
        total_consultations: 1220,
      },
      {
        id: '28',
        full_name: 'Dr. Usha Reddy',
        mobile_number: '9876543237',
        user_type: 'doctor',
        preferred_language: 'kannada',
        medical_degree: 'MBBS, DNB (Ortho)',
        specialization: 'Orthopedist',
        consultation_fee: 580,
        current_location: { lat: 12.975, lng: 77.595 },
        location_address: 'Bangalore, Karnataka',
        is_available: false,
        rating: 4.5,
        total_consultations: 950,
      },
      // Trauma Surgeons
      {
        id: '29',
        full_name: 'Dr. Nitin Singh',
        mobile_number: '9876543238',
        user_type: 'doctor',
        preferred_language: 'hindi',
        medical_degree: 'MBBS, MS (General Surgery), MCh',
        specialization: 'Trauma Surgeon',
        consultation_fee: 750,
        current_location: { lat: 12.969, lng: 77.592 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.8,
        total_consultations: 1140,
      },
      {
        id: '30',
        full_name: 'Dr. Padmini Iyengar',
        mobile_number: '9876543239',
        user_type: 'doctor',
        preferred_language: 'english',
        medical_degree: 'MBBS, MS (Trauma Surgery)',
        specialization: 'Trauma Surgeon',
        consultation_fee: 720,
        current_location: { lat: 12.973, lng: 77.593 },
        location_address: 'Bangalore, Karnataka',
        is_available: true,
        rating: 4.6,
        total_consultations: 1020,
      },
    ];

    // Always seed with the latest mock doctors to ensure we have enough doctors
      saveAllDoctors(mockDoctors);
    setDoctors(mockDoctors);
  };

  // const specializations = ['all', ...new Set(doctors.map(d => d.specialization))];

  // Hide general list computation since we only need recommended names

  // Filter doctors by recommended specialization if available
  const recommendedDoctors = recommendedSpecs.length
    ? doctors.filter(d => recommendedSpecs.includes(d.specialization))
    : doctors;

  const resetBookingForm = () => {
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setAppointmentDate('');
    setAppointmentTime('');
    setErrors({});
  };

  const handleBook = async (appointmentData?: any) => {
    if (!bookingDoctor) return;
    // If invoked from EnhancedAppointmentBooking, trust provided validated data
    // Otherwise, validate local form fields
    if (!appointmentData) {
      const newErrors: { name?: string; age?: string; phone?: string } = {};
      if (!/^[A-Za-z ]+$/.test(patientName.trim())) {
        newErrors.name = 'Name should contain only alphabets and spaces';
      }
      const ageNum = Number(patientAge);
      if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
        newErrors.age = 'Age must be between 0 and 120';
      }
      if (!/^\d{10}$/.test(patientPhone.trim())) {
        newErrors.phone = 'Mobile number must be exactly 10 digits';
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
      if (!appointmentDate || !appointmentTime) return;
    }
    setBookingSubmitting(true);
    try {
      // Mock booking flow
      await new Promise(r => setTimeout(r, 800));
      
      // Create notification
      createAppointmentNotification(bookingDoctor.full_name, new Date().toLocaleDateString());
      
      // Generate Google Meet link for online appointments
      const mode = appointmentData?.consultation_mode || appointmentMode;
      const meetLink = mode === 'online' 
        ? 'https://meet.google.com/new'
        : null;

      // Persist appointment to localStorage and notify listeners
      const appointmentId = `apt-${Date.now()}`;
      const dateStr = appointmentData?.appointment_date || appointmentDate;
      const timeStr = appointmentData?.appointment_time || appointmentTime;
      const appointmentDateTime = new Date(`${dateStr}T${timeStr}`);
      const appointmentRecord = {
        id: appointmentId,
        patient_id: profile?.id || 'patient-1',
        doctor_id: appointmentData?.doctor_id || bookingDoctor.id,
        appointment_date: appointmentDateTime.toISOString(),
        status: 'pending',
        consultation_mode: mode,
        doctor: bookingDoctor,
        patient: {
          id: profile?.id || 'patient-1',
          full_name: appointmentData?.patient_name || patientName,
          mobile_number: appointmentData?.patient_phone || patientPhone,
          user_type: 'patient',
          preferred_language: 'english',
        },
      };
      const key = `patient_appointments_${profile?.id || 'patient-1'}`;
      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [...existing, appointmentRecord];
      localStorage.setItem(key, JSON.stringify(updated));

      // Dispatch a custom event for real-time updates
      window.dispatchEvent(new CustomEvent('appointment_created', { detail: appointmentRecord }));

      const patientNameDisplay = appointmentData?.patient_name || patientName;
      const finalDate = dateStr;
      const finalTime = timeStr;
      alert(`Appointment booked with ${bookingDoctor.full_name} for ${patientNameDisplay}\n${mode === 'online' ? `Join via: ${meetLink}` : 'Offline appointment'}\nOn: ${finalDate} at ${finalTime}`);
      setBookingDoctor(null);
      resetBookingForm();
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('find_doctors')}</h2>

      {/* Button to get AI recommendations */}
      <div className="mb-4 flex gap-3 items-center flex-wrap">
        <button
          onClick={loadAIRecommendations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>🤖</span>
          Get AI Recommended Specialists
        </button>
        <button
          onClick={() => setRecommendedSpecs([])}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>👥</span>
          Show All Specialists
        </button>
        {recommendedSpecs.length > 0 && (
          <span className="text-sm text-gray-600">
            Found {recommendedSpecs.length} recommended specialty: {recommendedSpecs.join(', ')}
          </span>
        )}
      </div>

      {/* Show AI-recommended specialist info if available */}
      {recommendedSpecs.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">AI Recommended Specialist</h3>
          <p className="text-blue-700">
            Based on your symptoms, we recommend: <span className="font-semibold">{recommendedSpecs.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Show recommended specialists or all available specialists */}
      {recommendedDoctors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {recommendedSpecs.length > 0 ? `Recommended ${recommendedSpecs.join(', ')} Specialists` : 'Available Specialists'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedDoctors.map((doctor) => (
            <div
              key={doctor.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{doctor.full_name}</h3>
                  <p className="text-sm text-gray-600">{doctor.medical_degree}</p>
                  <p className="text-teal-600 font-semibold">{doctor.specialization}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  doctor.is_available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                    {doctor.is_available ? 'Available' : 'Not Available'}
                </div>
              </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-yellow-500">★</span>
                  <span>{doctor.rating} / 5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">₹</span>
                  <span>{doctor.consultation_fee}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-600">👥</span>
                  <span>{doctor.total_consultations} patients</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-purple-600">📍</span>
                    <button
                      type="button"
                      onClick={() => setShowMap(doctor.id)}
                      className="truncate text-blue-600 hover:underline text-left"
                      title="View on map"
                    >
                      {doctor.location_address}
                    </button>
                  </div>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!doctor.is_available}
                  onClick={() => setBookingDoctor(doctor)}
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>📅</span>
                    Book Appointment
                </button>
                <button
                  disabled={!doctor.is_available}
                  onClick={() => setShowChat(doctor.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  💬 Chat
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Show message if no doctors available */}
      {recommendedDoctors.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            {recommendedSpecs.length > 0 
              ? 'No doctors found for your condition. Please try a different symptom or disease description.'
              : 'No doctors available at the moment. Please try again later.'
            }
          </p>
        </div>
      )}

      {/* Enhanced Booking Modal */}
      {bookingDoctor && (
        <EnhancedAppointmentBooking
          doctor={bookingDoctor}
          onClose={() => { setBookingDoctor(null); resetBookingForm(); }}
          onBook={handleBook}
        />
      )}

      {/* Google Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Doctor Location</h3>
              <button
                onClick={() => setShowMap(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            {recommendedDoctors.find(d => d.id === showMap) && (
              <DoctorMap doctor={recommendedDoctors.find(d => d.id === showMap)!} />
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 h-[80vh] flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Chat</h3>
              <button
                onClick={() => setShowChat(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {recommendedDoctors.find(d => d.id === showChat) && (
                <ChatInterface
                  recipientId={showChat}
                  recipientName={recommendedDoctors.find(d => d.id === showChat)!.full_name}
                  currentUserId="patient-1"
                  currentUserName="Patient User"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
