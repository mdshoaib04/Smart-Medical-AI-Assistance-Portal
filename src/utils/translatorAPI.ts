import { Language } from '../types';

const translationCache = new Map<string, string>();

const translationDatabase: Record<Language, Record<string, string>> = {
  english: {},
  hindi: {
    'Fever': 'बुखार',
    'Cold': 'जुकाम',
    'Cough': 'खांसी',
    'Headache': 'सिर दर्द',
    'Stomach pain': 'पेट दर्द',
    'Back pain': 'कमर दर्द',
    'Chest pain': 'सीने में दर्द',
    'Chest Pain': 'सीने में दर्द',
    'Respiratory Issue': 'श्वसन समस्या',
    'General Health Consultation': 'सामान्य स्वास्थ्य परामर्श',
    'Rest adequately': 'पर्याप्त आराम करें',
    'Drink plenty of fluids': 'खूब सारे तरल पदार्थ पिएं',
    'Stay hydrated': 'हाइड्रेटेड रहें',
    'Apply cold compress': 'ठंडा सेंक लगाएं',
    'Consult with a doctor': 'डॉक्टर से परामर्श करें',
    'Maintain healthy lifestyle': 'स्वस्थ जीवनशैली बनाए रखें',
    'Take paracetamol if needed': 'आवश्यकता होने पर पैरासिटामोल लें',
    'Monitor temperature regularly': 'नियमित रूप से तापमान की निगरानी करें',
    'Take steam inhalation': 'भाप का इनहेलेशन करें',
    'Gargle with warm salt water': 'गर्म नमक के पानी से गरारे करें',
    'Get adequate rest': 'पर्याप्त आराम करें',
    'Drink warm liquids': 'गर्म तरल पदार्थ पिएं',
    'Honey with warm water': 'गर्म पानी के साथ शहद',
    'Avoid cold foods': 'ठंडे खाद्य पदार्थों से बचें',
    'Use humidifier': 'ह्यूमिडिफायर का उपयोग करें',
    'Rest in a dark room': 'अंधेरे कमरे में आराम करें',
    'Avoid loud noises': 'तेज आवाज से बचें',
    'Eat bland foods': 'बेस्वाद भोजन खाएं',
    'Avoid spicy food': 'मसालेदार भोजन से बचें',
    'Drink ginger tea': 'अदरक की चाय पिएं',
    'Rest and avoid stress': 'आराम करें और तनाव से बचें',
    'Seek immediate medical attention': 'तुरंत चिकित्सा सहायता लें',
    'Sit down and rest': 'बैठ जाएं और आराम करें',
    'Do not exert yourself': 'अपने आप को परेशान न करें',
  },
  kannada: {
    'Fever': 'ಜ್ವರ',
    'Cold': 'ಶೀತ',
    'Cough': 'ಕೆಮ್ಮು',
    'Headache': 'ತಲೆನೋವು',
    'Stomach pain': 'ಹೊಟ್ಟೆ ನೋವು',
    'Back pain': 'ಬೆನ್ನು ನೋವು',
    'Chest pain': 'ಎದೆ ನೋವು',
    'Chest Pain': 'ಎದೆ ನೋವು',
    'Respiratory Issue': 'ಉಸಿರಾಟದ ಸಮಸ್ಯೆ',
    'General Health Consultation': 'ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಸಮಾಲೋಚನೆ',
    'Rest adequately': 'ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ',
    'Drink plenty of fluids': 'ಸಾಕಷ್ಟು ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ',
    'Stay hydrated': 'ಹೈಡ್ರೇಟ್ ಆಗಿರಿ',
    'Apply cold compress': 'ತಣ್ಣನೆಯ ಸೆಂಕವನ್ನು ಅನ್ವಯಿಸಿ',
    'Consult with a doctor': 'ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
    'Maintain healthy lifestyle': 'ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿಯನ್ನು ನಿರ್ವಹಿಸಿ',
    'Take paracetamol if needed': 'ಅಗತ್ಯವಿದ್ದರೆ ಪ್ಯಾರಸಿಟಮಾಲ್ ತೆಗೆದುಕೊಳ್ಳಿ',
    'Monitor temperature regularly': 'ನಿಯಮಿತವಾಗಿ ತಾಪಮಾನವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ',
    'Take steam inhalation': 'ಉಗಿ ಇನ್ಹಲೇಶನ್ ತೆಗೆದುಕೊಳ್ಳಿ',
    'Gargle with warm salt water': 'ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರಿನಿಂದ ಗಾರ್ಗಲ್ ಮಾಡಿ',
    'Get adequate rest': 'ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ',
    'Drink warm liquids': 'ಬೆಚ್ಚಗಿನ ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ',
    'Honey with warm water': 'ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ ಜೇನು',
    'Avoid cold foods': 'ತಣ್ಣನೆಯ ಆಹಾರಗಳನ್ನು ತಪ್ಪಿಸಿ',
    'Use humidifier': 'ಹ್ಯೂಮಿಡಿಫೈಯರ್ ಬಳಸಿ',
    'Rest in a dark room': 'ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ',
    'Avoid loud noises': 'ಜೋರಾಗಿ ಶಬ್ದಗಳನ್ನು ತಪ್ಪಿಸಿ',
    'Eat bland foods': 'ಸರಳ ಆಹಾರಗಳನ್ನು ತಿನ್ನಿರಿ',
    'Avoid spicy food': 'ಖಾರದ ಆಹಾರವನ್ನು ತಪ್ಪಿಸಿ',
    'Drink ginger tea': 'ಶುಂಠಿ ಚಹಾ ಕುಡಿಯಿರಿ',
    'Rest and avoid stress': 'ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಒತ್ತಡವನ್ನು ತಪ್ಪಿಸಿ',
    'Seek immediate medical attention': 'ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ',
    'Sit down and rest': 'ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ',
    'Do not exert yourself': 'ನಿಮ್ಮನ್ನು ಪರಿಶ್ರಮ ಮಾಡಬೇಡಿ',
  },
};

export const translateTextAPI = async (
  text: string,
  targetLanguage: Language
): Promise<string> => {
  if (!text || targetLanguage === 'english') {
    return text;
  }

  const cacheKey = `${text}_${targetLanguage}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  await new Promise(resolve => setTimeout(resolve, 100));

  const translated = translationDatabase[targetLanguage][text] || text;
  translationCache.set(cacheKey, translated);

  return translated;
};

export const translateArray = async (
  items: string[],
  targetLanguage: Language
): Promise<string[]> => {
  if (targetLanguage === 'english') {
    return items;
  }

  const promises = items.map(item => translateTextAPI(item, targetLanguage));
  return Promise.all(promises);
};

export const clearTranslationCache = () => {
  translationCache.clear();
};
