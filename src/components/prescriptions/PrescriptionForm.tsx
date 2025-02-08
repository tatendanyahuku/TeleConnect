import React, { useState } from 'react';
import { Prescription } from '../../types';
import { Plus, Minus, FileText } from 'lucide-react';

interface PrescriptionFormProps {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  onSubmit: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function PrescriptionForm({
  appointmentId,
  doctorId,
  patientId,
  onSubmit,
  onCancel,
}: PrescriptionFormProps) {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [instructions, setInstructions] = useState('');

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (
    index: number,
    field: keyof (typeof medications)[0],
    value: string
  ) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      appointmentId,
      doctorId,
      patientId,
      medications,
      instructions,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold">Write Prescription</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {medications.map((medication, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Medication #{index + 1}</h3>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) =>
                      handleMedicationChange(index, 'name', e.target.value)
                    }
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) =>
                      handleMedicationChange(index, 'dosage', e.target.value)
                    }
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={medication.frequency}
                    onChange={(e) =>
                      handleMedicationChange(index, 'frequency', e.target.value)
                    }
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) =>
                      handleMedicationChange(index, 'duration', e.target.value)
                    }
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddMedication}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Another Medication
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit Prescription
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}