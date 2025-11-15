import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MapPin } from 'lucide-react';
import { AnimatedCalendar } from '../Common/AnimatedCalendar';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  experience: number;
  rating: number;
  consultation_fee: number;
  location: string;
  consultation_mode: 'online' | 'offline';
}

interface AppointmentBookingProps {
  doctor: Doctor;
  onClose: () => void;
  onBook: (appointmentData: any) => void;
}

export const EnhancedAppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctor,
  onClose,
  onBook,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Generate time slots with 10-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!patientName.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!patientAge.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(patientAge)) || Number(patientAge) < 1 || Number(patientAge) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!patientPhone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(patientPhone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    } else if (new Date(selectedDate) < new Date(today)) {
      newErrors.date = 'Cannot book appointments for past dates';
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const appointmentData = {
      doctor_id: doctor.id,
      patient_name: patientName,
      patient_age: patientAge,
      patient_phone: patientPhone,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      symptoms: symptoms,
      consultation_mode: doctor.consultation_mode,
      status: 'pending' as const,
    };

    try {
      await onBook(appointmentData);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Book Appointment</h2>
              <div className="flex items-center space-x-4 text-teal-100">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{doctor.full_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm capitalize">{doctor.consultation_mode}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-teal-600" />
              <span>Patient Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (Optional)
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Brief description of symptoms"
                />
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Select Date & Time</span>
            </h3>

            {/* Animated Calendar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Appointment Date *
              </label>
              <AnimatedCalendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(''); // Reset time when date changes
                  setShowTimeSlots(false);
                }}
                minDate={today}
                className="w-full"
              />
              {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
              {selectedDate && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Selected: {formatDate(selectedDate)}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTimeSlots(!showTimeSlots)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-left flex items-center justify-between"
                    disabled={!selectedDate}
                  >
                    <span className={selectedTime ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedTime || 'Select a time slot'}
                    </span>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {showTimeSlots && selectedDate && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            setShowTimeSlots(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Appointment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Doctor:</span>
                <span className="ml-2 font-medium">{doctor.full_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Specialization:</span>
                <span className="ml-2 font-medium">{doctor.specialization}</span>
              </div>
              <div>
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="ml-2 font-medium">₹{doctor.consultation_fee}</span>
              </div>
              <div>
                <span className="text-gray-600">Mode:</span>
                <span className="ml-2 font-medium capitalize">{doctor.consultation_mode}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
