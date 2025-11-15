export type UserType = 'patient' | 'doctor';
export type Language = 'english' | 'hindi' | 'kannada';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ConsultationMode = 'online' | 'offline';
export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';
export type EmergencyStatus = 'active' | 'assigned' | 'completed' | 'cancelled';

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  full_name: string;
  mobile_number: string;
  user_type: UserType;
  preferred_language: Language;
}

export interface Doctor extends User {
  medical_degree: string;
  specialization: string;
  consultation_fee: number;
  registration_number?: string;
  current_location?: Location;
  location_address?: string;
  is_available: boolean;
  rating: number;
  total_consultations: number;
}

export interface Patient extends User {
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  blood_group?: string;
  current_location?: Location;
  location_address?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  status: AppointmentStatus;
  consultation_mode: ConsultationMode;
  symptoms?: string;
  diagnosis?: string;
  prescribed_medicines?: string[];
  doctor?: Doctor;
  patient?: Patient;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  symptoms: string;
  ai_detected_disease?: string;
  severity?: Severity;
  home_remedies?: string[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  appointment_id: string;
  sender_id: string;
  message: string;
  original_language: Language;
  translated_message?: Record<Language, string>;
  message_type: 'text' | 'voice';
  created_at: string;
}

export interface EmergencyRequest {
  id: string;
  patient_id: string;
  location: Location;
  location_address?: string;
  status: EmergencyStatus;
  ambulance_details?: any;
  created_at: string;
}

export interface SymptomAnalysis {
  disease: string;
  severity: Severity;
  confidence: number;
  home_remedies: string[];
  recommended_specialization: string;
  recommended_specializations?: string[];
  safety_video_url?: string;
}
