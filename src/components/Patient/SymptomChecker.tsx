import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeSymptoms, startVoiceRecognition } from '../../utils/aiService';
import { SymptomAnalysis } from '../../types';
import { Brain, Mic, MicOff, Loader, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export const SymptomChecker: React.FC = () => {
  const { t, language } = useLanguage();
  const [symptoms, setSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setAnalyzing(true);
    try {
      const result = await analyzeSymptoms(symptoms, language);
      setAnalysis(result);
      // Persist recommended specialization for auto-filtering doctors list
      try {
        localStorage.setItem('medilink_recommended_specialization', result.recommended_specialization);
        if (result.recommended_specializations && result.recommended_specializations.length > 0) {
          localStorage.setItem('medilink_recommended_specializations', JSON.stringify(result.recommended_specializations));
        }
        localStorage.setItem('medilink_detected_disease', result.disease);
      } catch {}
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording && stopRecording) {
      stopRecording();
      setIsRecording(false);
      setStopRecording(null);
    } else {
      const stop = startVoiceRecognition(
        language,
        (transcript) => {
          setSymptoms(transcript);
          setIsRecording(false);
          setStopRecording(null);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          setIsRecording(false);
          setStopRecording(null);
        }
      );
      setStopRecording(() => stop);
      setIsRecording(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-700 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold text-gray-800">{t('symptom_checker')}</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('describe_symptoms')}
          </label>
          <div className="relative">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px]"
              disabled={isRecording}
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          {isRecording && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
              <span className="animate-pulse">●</span> Recording...
            </p>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!symptoms.trim() || analyzing}
          className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            t('analyze')
          )}
        </button>

        {analysis && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-500">
            <div className={`border-2 rounded-lg p-4 ${getSeverityColor(analysis.severity)}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Possible Condition</h3>
                  <p className="text-xl font-semibold">{analysis.disease}</p>
                  <p className="text-sm mt-1 opacity-90">
                    Severity: <span className="capitalize font-semibold">{analysis.severity}</span>
                  </p>
                  <p className="text-sm opacity-90">
                    Confidence: {(analysis.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recommended Specialist
              </h4>
              {analysis.recommended_specializations && analysis.recommended_specializations.length > 1 ? (
                <ul className="list-disc list-inside text-blue-800">
                  {analysis.recommended_specializations.map((spec) => (
                    <li key={spec} className="font-semibold">{spec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-800 font-semibold">{analysis.recommended_specialization}</p>
              )}
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-3">{t('home_remedies')}</h4>
              <ul className="space-y-2">
                {analysis.home_remedies.map((remedy, index) => (
                  <li key={index} className="flex items-start gap-2 text-green-800">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.safety_video_url && (
              <a
                href={analysis.safety_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Watch Health Safety Videos
              </a>
            )}

            {analysis.severity === 'critical' && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 animate-pulse">
                <p className="text-red-900 font-bold text-center">
                  ⚠️ {t('emergency_alert')}
                </p>
                <p className="text-red-800 text-center mt-1">
                  Please seek immediate medical attention
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
