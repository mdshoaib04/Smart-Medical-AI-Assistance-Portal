import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'english', label: 'English', flag: '🇬🇧' },
    { value: 'hindi', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-4 py-2">
      <Languages className="w-5 h-5 text-teal-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent border-none focus:outline-none font-semibold text-gray-700 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
