import { SymptomAnalysis, Severity, Language } from '../types';
import { translateTextAPI, translateArray } from './translatorAPI';

// Base map: conditions to one or more relevant specializations
const baseDiseaseDatabase: Record<string, { specializations: string[]; severity: Severity; remedies: string[] }> = {
  'fever': { specializations: ['General Physician'], severity: 'mild', remedies: ['Rest adequately', 'Drink plenty of fluids', 'Take paracetamol if needed', 'Monitor temperature regularly'] },
  'cold': { specializations: ['General Physician'], severity: 'mild', remedies: ['Stay hydrated', 'Take steam inhalation', 'Gargle with warm salt water', 'Get adequate rest'] },
  'cough': { specializations: ['General Physician'], severity: 'mild', remedies: ['Drink warm liquids', 'Honey with warm water', 'Avoid cold foods', 'Use humidifier'] },
  'headache': { specializations: ['Neurologist', 'General Physician'], severity: 'mild', remedies: ['Rest in a dark room', 'Apply cold compress', 'Stay hydrated', 'Avoid loud noises'] },
  'stomach pain': { specializations: ['Gastroenterologist'], severity: 'moderate', remedies: ['Eat bland foods', 'Avoid spicy food', 'Drink ginger tea', 'Rest and avoid stress'] },
  'chest pain': { specializations: ['Cardiologist'], severity: 'severe', remedies: ['Seek immediate medical attention', 'Sit down and rest', 'Do not exert yourself'] },
  'difficulty breathing': { specializations: ['Pulmonologist'], severity: 'critical', remedies: ['Call emergency services immediately', 'Sit upright', 'Stay calm'] },
  'diabetes symptoms': { specializations: ['Endocrinologist'], severity: 'moderate', remedies: ['Monitor blood sugar levels', 'Follow prescribed diet', 'Exercise regularly', 'Take medications as prescribed'] },
  'skin rash': { specializations: ['Dermatologist'], severity: 'mild', remedies: ['Keep area clean and dry', 'Apply calamine lotion', 'Avoid scratching', 'Wear loose clothing'] },
  'back pain': { specializations: ['Orthopedist'], severity: 'moderate', remedies: ['Apply hot or cold compress', 'Gentle stretching', 'Maintain good posture', 'Avoid heavy lifting'] },
  'anxiety': { specializations: ['Psychiatrist'], severity: 'moderate', remedies: ['Practice deep breathing', 'Regular exercise', 'Adequate sleep', 'Talk to someone you trust'] },
  'migraine': { specializations: ['Neurologist', 'General Physician'], severity: 'moderate', remedies: ['Rest in dark quiet room', 'Cold compress on forehead', 'Avoid triggers', 'Stay hydrated'] },
  'diarrhea': { specializations: ['Gastroenterologist'], severity: 'moderate', remedies: ['Stay hydrated with ORS', 'Eat bland foods like rice', 'Avoid dairy products', 'Rest adequately'] },
  'high blood pressure': { specializations: ['Cardiologist'], severity: 'moderate', remedies: ['Reduce salt intake', 'Regular exercise', 'Manage stress', 'Take prescribed medications'] },
  'asthma': { specializations: ['Pulmonologist'], severity: 'moderate', remedies: ['Use prescribed inhaler', 'Avoid triggers', 'Practice breathing exercises', 'Keep emergency medication handy'] },
  // Add robust bone injury/fracture mapping
  'fracture': { specializations: ['Orthopedist', 'Trauma Surgeon'], severity: 'severe', remedies: ['Immobilize the area', 'Apply cold pack wrapped in cloth', 'Avoid moving the injured limb', 'Seek immediate medical care'] },
  'bone fracture': { specializations: ['Orthopedist', 'Trauma Surgeon'], severity: 'severe', remedies: ['Immobilize the area', 'Apply cold pack wrapped in cloth', 'Avoid moving the injured limb', 'Seek immediate medical care'] },
  'bone injury': { specializations: ['Orthopedist', 'Trauma Surgeon'], severity: 'moderate', remedies: ['Rest and immobilize', 'Cold compress', 'Elevate if possible', 'Consult orthopedic specialist'] },
};

// Overlay store in localStorage to allow adding/updating mappings without code changes
const DISEASE_DB_OVERLAY_KEY = 'medilink_disease_db_overlay_v1';

function loadDiseaseOverlay(): Record<string, { specializations: string[]; severity: Severity; remedies: string[] }> {
  try {
    const raw = localStorage.getItem(DISEASE_DB_OVERLAY_KEY);
    if (!raw) return {} as any;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {}
  return {} as any;
}

function mergedDiseaseDatabase(): Record<string, { specializations: string[]; severity: Severity; remedies: string[] }> {
  return { ...baseDiseaseDatabase, ...loadDiseaseOverlay() } as any;
}

export function upsertDiseaseMapping(diseaseKey: string, data: { specializations: string[]; severity: Severity; remedies: string[] }) {
  const key = diseaseKey.trim().toLowerCase();
  const overlay = loadDiseaseOverlay();
  overlay[key] = { ...data, specializations: [...data.specializations] } as any;
  try {
    localStorage.setItem(DISEASE_DB_OVERLAY_KEY, JSON.stringify(overlay));
  } catch {}
}

export const analyzeSymptoms = async (symptoms: string, language: Language = 'english'): Promise<SymptomAnalysis> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const symptomsLower = symptoms.toLowerCase();
  let detectedDisease = 'General Health Consultation';
  let matchedData = { specializations: ['General Physician'], severity: 'mild' as Severity, remedies: ['Consult with a doctor', 'Maintain healthy lifestyle'] };

  const diseaseDatabase = mergedDiseaseDatabase();
  for (const [disease, data] of Object.entries(diseaseDatabase)) {
    if (symptomsLower.includes(disease)) {
      detectedDisease = disease.charAt(0).toUpperCase() + disease.slice(1);
      matchedData = data;
      break;
    }
  }

  if (symptomsLower.includes('pain') && symptomsLower.includes('chest')) {
    detectedDisease = 'Chest Pain';
    matchedData = diseaseDatabase['chest pain'];
  } else if (symptomsLower.includes('breath') || symptomsLower.includes('breathing')) {
    detectedDisease = 'Respiratory Issue';
    matchedData = diseaseDatabase['difficulty breathing'];
  }

  // Heuristic: if text contains bone/fracture keywords, ensure orthopedics/trauma are suggested
  const boneKeywords = ['fracture', 'bone', 'broken', 'sprain'];
  if (boneKeywords.some(k => symptomsLower.includes(k))) {
    detectedDisease = detectedDisease === 'General Health Consultation' ? 'Bone Injury' : detectedDisease;
    matchedData = diseaseDatabase['bone fracture'] || matchedData;
  }

  const translatedDisease = await translateTextAPI(detectedDisease, language);
  const translatedRemedies = await translateArray(matchedData.remedies, language);

  return {
    disease: translatedDisease,
    severity: matchedData.severity,
    confidence: 0.85,
    home_remedies: translatedRemedies,
    // Return the first as primary for backward-compat consumers, but also include list
    recommended_specialization: matchedData.specializations[0],
    recommended_specializations: matchedData.specializations,
    safety_video_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(detectedDisease + ' home remedies')}`,
  };
};

export const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return text;
};

export const startVoiceRecognition = (
  language: string,
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): () => void => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError?.('Speech recognition is not supported in this browser');
    return () => {};
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const langMap: Record<string, string> = {
    english: 'en-IN',
    hindi: 'hi-IN',
    kannada: 'kn-IN',
  };

  recognition.lang = langMap[language] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error);
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
};
