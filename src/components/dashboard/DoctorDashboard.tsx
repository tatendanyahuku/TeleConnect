import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ChatInterface from '../chat/ChatInterface';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import { Calendar, MessageSquare, User, LogOut, Upload, CheckCircle, History, Clock, Bell, FileText, Settings, Stethoscope, MapPin, DollarSign, Check, X, Image } from 'lucide-react';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'prescriptions' | 'notifications' | 'profile'>('pending');
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    speciality: '',
    location: '',
    bio: '',
    minFee: 0,
    maxFee: 0,
    avatarUrl: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.currentUser) {
    navigate('/login');
    return null;
  }

  const currentDoctor = state.doctors.find(d => d.id === state.currentUser?.id);

  React.useEffect(() => {
    if (currentDoctor) {
      setProfileData({
        speciality: currentDoctor.speciality,
        location: currentDoctor.location,
        bio: currentDoctor.bio,
        minFee: currentDoctor.minFee,
        maxFee: currentDoctor.maxFee,
        avatarUrl: currentDoctor.avatarUrl || '',
      });
    }
  }, [currentDoctor]);

  const pendingAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'pending'
  );

  const activeAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'accepted'
  );

  const completedAppointments = state.appointments.filter(
    (apt) => apt.doctorId === state.currentUser?.id && apt.status === 'completed'
  );

  const prescriptions = completedAppointments
    .filter(apt => apt.prescription)
    .map(apt => ({
      ...apt.prescription!,
      appointment: apt,
      patient: state.patients.find(p => p.id === apt.patientId),
    }));

  const notifications = state.notifications.filter(
    (notif) => notif.userId === state.currentUser?.id
  );

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };

  const handleAppointmentAction = (appointmentId: string, status: 'accepted' | 'rejected') => {
    const appointment = state.appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: { ...appointment, status },
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          userId: appointment.patientId,
          message: `Your appointment request has been ${status} by Dr. ${state.currentUser.name}`,
          createdAt: new Date(),
          read: false,
        },
      });
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    const appointment = state.appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointmentId);
      setShowPrescriptionForm(true);
    }
  };

  const handlePrescriptionSubmit = (prescriptionData: any) => {
    if (!state.currentUser) return;

    const prescription = {
      id: crypto.randomUUID(),
      ...prescriptionData,
      createdAt: new Date(),
    };

    const appointment = state.appointments.find((apt) => apt.id === prescriptionData.appointmentId);
    if (appointment) {
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: {
          ...appointment,
          status: 'completed',
          prescription,
        },
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          userId: appointment.patientId,
          message: `Your appointment with Dr. ${state.currentUser.name} has been completed. A prescription has been issued.`,
          createdAt: new Date(),
          read: false,
        },
      });
    }

    setShowPrescriptionForm(false);
    setSelectedAppointment(null);
  };

  const handleUpdateProfile = () => {
    if (currentDoctor) {
      dispatch({
        type: 'UPDATE_DOCTOR',
        payload: {
          ...currentDoctor,
          ...profileData,
        },
      });
      setEditProfile(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData({
        ...profileData,
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending
            {pendingAppointments.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                {pendingAppointments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Appointments
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
              activeTab === 'prescriptions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'notifications' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Appointments</h2>
          {pendingAppointments.length === 0 ? (
            <p className="text-gray-600">No pending appointments.</p>
          ) : (
            pendingAppointments.map((appointment) => {
              const patient = state.patients.find(
                (p) => p.id === appointment.patientId
              );
              return (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{patient?.name}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>
                          {new Date(appointment.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">Proposed Fee: ${appointment.proposedFee}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'accepted')}
                        className="flex items-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                        className="flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Appointments</h2>
          {activeAppointments.length === 0 ? (
            <p className="text-gray-600">No active appointments.</p>
          ) : (
            activeAppointments.map((appointment) => {
              const patient = state.patients.find(
                (p) => p.id === appointment.patientId
              );
              return (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{patient?.name}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>
                          {new Date(appointment.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCompleteAppointment(appointment.id)}
                        className="flex items-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete & Prescribe
                      </button>
                      <button
                        onClick={() => setSelectedChat(appointment.patientId)}
                        className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Completed Appointments</h2>
          {completedAppointments.length === 0 ? (
            <p className="text-gray-600">No completed appointments.</p>
          ) : (
            completedAppointments.map((appointment) => {
              const patient = state.patients.find(
                (p) => p.id === appointment.patientId
              );
              return (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{patient?.name}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <History className="w-5 h-5 mr-2" />
                        <span>
                          {new Date(appointment.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                      {appointment.prescription && (
                        <div className="mt-2 flex items-center text-green-600">
                          <FileText className="w-4 h-4 mr-2" />
                          Prescription Issued
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedChat(appointment.patientId)}
                      className="flex items-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Chat History
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Issued Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-gray-600">No prescriptions issued yet.</p>
          ) : (
            prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      <span className="font-semibold">{prescription.patient?.name}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>
                        {new Date(prescription.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Medications:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {prescription.medications.map((med, index) => (
                          <li key={index} className="text-gray-600">
                            {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-600">No notifications.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  !notification.read ? 'border-l-4 border-blue-600' : ''
                }`}
              >
                <p className="text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {!editProfile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl}
                        alt={currentDoctor?.name}
                        className="w-24 h-24 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <User className="w-24 h-24 text-blue-600 mr-4" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {currentDoctor?.name}</h3>
                      <p className="text-gray-600">{currentDoctor?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditProfile(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-start">
                    <Stethoscope className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">Speciality</p>
                      <p className="text-gray-600">{currentDoctor?.speciality || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">Location</p>
                      <p className="text-gray-600">{currentDoctor?.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">Consultation Fee Range</p>
                      <p className="text-gray-600">${currentDoctor?.minFee} - ${currentDoctor?.maxFee}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Bio</h4>
                  <p className="text-gray-600">{currentDoctor?.bio || 'No bio provided'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={currentDoctor?.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-24 h-24 text-blue-600" />
                  )}
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Upload Photo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speciality
                  </label>
                  <input
                    type="text"
                    value={profileData.speciality}
                    onChange={(e) => setProfileData({ ...profileData, speciality: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Fee ($)
                    </label>
                    <input
                      type="number"
                      value={profileData.minFee}
                      onChange={(e) => setProfileData({ ...profileData, minFee: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Fee ($)
                    </label>
                    <input
                      type="number"
                      value={profileData.maxFee}
                      onChange={(e) => setProfileData({ ...profileData, maxFee: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditProfile(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chat</h3>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <ChatInterface recipientId={selectedChat} />
          </div>
        </div>
      )}

      {showPrescriptionForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Write Prescription</h3>
              <button 
                onClick={() => {
                  setShowPrescriptionForm(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <PrescriptionForm
                appointmentId={selectedAppointment}
                doctorId={state.currentUser.id}
                patientId={state.appointments.find(apt => apt.id === selectedAppointment)?.patientId || ''}
                onSubmit={handlePrescriptionSubmit}
                onCancel={() => {
                  setShowPrescriptionForm(false);
                  setSelectedAppointment(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}