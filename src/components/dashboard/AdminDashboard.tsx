import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { User, UserCheck, UserX, Users, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const pendingDoctors = state.doctors.filter((doctor) => !doctor.isApproved);
  const approvedDoctors = state.doctors.filter((doctor) => doctor.isApproved);

  const handleDoctorApproval = (doctorId: string, approved: boolean) => {
    if (approved) {
      const doctor = state.doctors.find((d) => d.id === doctorId);
      if (doctor) {
        dispatch({
          type: 'UPDATE_DOCTOR',
          payload: { ...doctor, isApproved: true },
        });
      }
    } else {
      // If rejected, delete the doctor and their user profile
      dispatch({ type: 'DELETE_DOCTOR', payload: doctorId });
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Patients</h3>
              <p className="text-3xl font-bold">{state.patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Approved Doctors</h3>
              <p className="text-3xl font-bold">{approvedDoctors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Pending Approvals</h3>
              <p className="text-3xl font-bold">{pendingDoctors.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Doctor Applications</h2>
        <div className="space-y-6">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <h3 className="text-lg font-semibold">{doctor.name}</h3>
                </div>
                <p className="text-gray-600 mt-1">{doctor.email}</p>
                <p className="text-gray-600">Speciality: {doctor.speciality || 'Not specified'}</p>
                <p className="text-gray-600">Location: {doctor.location || 'Not specified'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDoctorApproval(doctor.id, true)}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDoctorApproval(doctor.id, false)}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-6">Approved Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
              </div>
              <p className="text-gray-600">{doctor.email}</p>
              <p className="text-gray-600">Speciality: {doctor.speciality || 'Not specified'}</p>
              <p className="text-gray-600">Location: {doctor.location || 'Not specified'}</p>
              <p className="text-gray-600">
                Fee Range: ${doctor.minFee} - ${doctor.maxFee}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}