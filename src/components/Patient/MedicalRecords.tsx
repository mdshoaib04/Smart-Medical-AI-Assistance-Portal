import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Stethoscope, Pill, Activity, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string;
  prescription?: string;
  notes?: string;
  visitType: 'consultation' | 'followup' | 'emergency';
}

export const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    doctorName: '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
    notes: '',
    visitType: 'consultation' as MedicalRecord['visitType'],
  });

  // Allow only alphabetic characters, spaces and common punctuation. Strip digits and symbols.
  const sanitizeText = (value: string) => {
    if (!value) return '';
    // Keep letters (any case), spaces, and , . - ' ( ) /
    const cleaned = value.replace(/[^A-Za-z\s,\.\-\'()\/]/g, '');
    return cleaned.replace(/\s{2,}/g, ' ').trimStart();
  };

  useEffect(() => {
    // Load records from localStorage
    const savedRecords = localStorage.getItem('patient_medical_records');
    if (savedRecords) {
      try {
        const parsed: any[] = JSON.parse(savedRecords);
        // Coerce all fields to strings to satisfy "string characters only"
        const normalized: MedicalRecord[] = parsed.map((r: any) => ({
          id: String(r.id || Date.now()),
          date: String(r.date || ''),
          doctorName: String(r.doctorName || ''),
          diagnosis: String(r.diagnosis || ''),
          symptoms: String(r.symptoms || ''),
          prescription: r.prescription != null ? String(r.prescription) : undefined,
          notes: r.notes != null ? String(r.notes) : undefined,
          visitType: (['consultation','followup','emergency'].includes(String(r.visitType)) ? r.visitType : 'consultation') as MedicalRecord['visitType'],
        }));
        setRecords(normalized);
      } catch (e) {
        console.error('Failed to load records:', e);
      }
    }
  }, []);

  const saveRecords = (newRecords: MedicalRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('patient_medical_records', JSON.stringify(newRecords));
  };

  const handleCreateRecord = () => {
    if (!formData.date || !formData.doctorName || !formData.diagnosis) return;

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      date: String(formData.date),
      doctorName: String(formData.doctorName),
      diagnosis: String(formData.diagnosis),
      symptoms: String(formData.symptoms),
      prescription: formData.prescription ? String(formData.prescription) : undefined,
      notes: formData.notes ? String(formData.notes) : undefined,
      visitType: formData.visitType,
    };

    const updatedRecords = [newRecord, ...records];
    saveRecords(updatedRecords);
    resetForm();
    setIsCreating(false);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingId(record.id);
    setFormData({
      date: record.date,
      doctorName: record.doctorName,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms,
      prescription: record.prescription || '',
      notes: record.notes || '',
      visitType: record.visitType,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updatedRecords = records.map(r =>
      r.id === editingId
        ? {
            ...r,
            date: String(formData.date),
            doctorName: String(formData.doctorName),
            diagnosis: String(formData.diagnosis),
            symptoms: String(formData.symptoms),
            prescription: formData.prescription ? String(formData.prescription) : undefined,
            notes: formData.notes ? String(formData.notes) : undefined,
            visitType: formData.visitType,
          }
        : r
    );
    saveRecords(updatedRecords);
    resetForm();
    setEditingId(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      const updatedRecords = records.filter(r => r.id !== id);
      saveRecords(updatedRecords);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      doctorName: '',
      diagnosis: '',
      symptoms: '',
      prescription: '',
      notes: '',
      visitType: 'consultation',
    });
  };

  const getVisitTypeColor = (type: MedicalRecord['visitType']) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-700';
      case 'followup':
        return 'bg-blue-100 text-blue-700';
      case 'consultation':
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No medical records yet</p>
            <p className="text-sm">Add a record to track your health history</p>
          </div>
        ) : (
          records.map(record => (
            <div
              key={record.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-800">{record.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getVisitTypeColor(record.visitType)}`}>
                      {record.visitType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-semibold">{record.doctorName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRecord(record)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Diagnosis:</p>
                  <p className="text-gray-800">{record.diagnosis}</p>
                </div>
                {record.symptoms && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Symptoms:</p>
                    <p className="text-gray-600">{record.symptoms}</p>
                  </div>
                )}
                {record.prescription && (
                  <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded">
                    <Pill className="w-4 h-4 text-yellow-700 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800">Prescription:</p>
                      <p className="text-yellow-900 text-sm">{record.prescription}</p>
                    </div>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Notes:</p>
                    <p className="text-gray-600 text-sm">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingId) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Record' : 'Add Medical Record'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type *
                </label>
                <select
                  value={formData.visitType}
                  onChange={(e) => setFormData({ ...formData, visitType: e.target.value as MedicalRecord['visitType'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: sanitizeText(e.target.value) })}
                  placeholder="Dr. Name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: sanitizeText(e.target.value) })}
                  placeholder="Enter diagnosis"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: sanitizeText(e.target.value) })}
                  placeholder="Describe symptoms"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription
                </label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: sanitizeText(e.target.value) })}
                  placeholder="Medications prescribed"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: sanitizeText(e.target.value) })}
                  placeholder="Additional information"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleSaveEdit : handleCreateRecord}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
                >
                  <Save className="w-4 h-4" />
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




