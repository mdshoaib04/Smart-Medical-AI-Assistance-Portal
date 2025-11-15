import { Doctor } from '../types';

const DOCTORS_KEY = 'medilink_doctors_v1';

function loadDoctorsFromStorage(): Doctor[] {
  try {
    const raw = localStorage.getItem(DOCTORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Doctor[];
  } catch {}
  return [];
}

export function getAllDoctors(): Doctor[] {
  return loadDoctorsFromStorage();
}

export function saveAllDoctors(doctors: Doctor[]) {
  try {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
  } catch {}
}

export function upsertDoctor(doctor: Doctor) {
  const doctors = loadDoctorsFromStorage();
  const idx = doctors.findIndex(d => d.id === doctor.id);
  if (idx >= 0) {
    doctors[idx] = { ...doctors[idx], ...doctor };
  } else {
    doctors.push(doctor);
  }
  saveAllDoctors(doctors);
}

export function deleteDoctor(id: string) {
  const doctors = loadDoctorsFromStorage().filter(d => d.id !== id);
  saveAllDoctors(doctors);
}

export function findDoctorsBySpecialization(specialization: string): Doctor[] {
  const doctors = loadDoctorsFromStorage();
  const key = specialization.toLowerCase();
  return doctors.filter(d => d.specialization.toLowerCase() === key);
}










