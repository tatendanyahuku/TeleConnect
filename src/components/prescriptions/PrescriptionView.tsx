import React from 'react';
import { Prescription } from '../../types';
import { FileText, Clock, Calendar, User } from 'lucide-react';

interface PrescriptionViewProps {
  prescription: Prescription;
  doctorName: string;
  patientName: string;
}

export default function PrescriptionView({
  prescription,
  doctorName,
  patientName,
}: PrescriptionViewProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="border-b pb-6 mb-6">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold">Prescription</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <User className="w-5 h-5 mr-2" />
            <span>
              <strong>Doctor:</strong> Dr. {doctorName}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="w-5 h-5 mr-2" />
            <span>
              <strong>Patient:</strong> {patientName}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span>
              <strong>Date:</strong>{' '}
              {new Date(prescription.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>
              <strong>Time:</strong>{' '}
              {new Date(prescription.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Medications</h3>
        <div className="space-y-4">
          {prescription.medications.map((medication, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <h4 className="font-semibold mb-2">
                {index + 1}. {medication.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>
                  <strong>Dosage:</strong> {medication.dosage}
                </div>
                <div>
                  <strong>Frequency:</strong> {medication.frequency}
                </div>
                <div>
                  <strong>Duration:</strong> {medication.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Instructions</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{prescription.instructions}</p>
      </div>
    </div>
  );
}