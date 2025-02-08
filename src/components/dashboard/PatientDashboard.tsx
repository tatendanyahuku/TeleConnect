import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Doctor, Appointment } from '../../types';
import ChatInterface from '../chat/ChatInterface';
import PrescriptionView from '../prescriptions/PrescriptionView';
import { Star, MapPin, Search, Calendar, LogOut, MessageSquare, Clock, Bell, History, User, DollarSign, FileText } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingData, setBookingData] = useState<{
    doctorId: string;
    date: string;
    proposedFee: number;
  } | null>(null);
  const [reviewData, setReviewData] = useState<{
    appointmentId: string;
    doctorId: string;
    rating: number;
    comment: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'pending' | 'approved' | 'completed' | 'prescriptions' | 'notifications'>('search');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };

  const pendingAppointments = state.appointments.filter(
    (apt) => apt.patientId === state.currentUser?.id && apt.status === 'pending'
  );

  const approvedAppointments = state.appointments.filter(
    (apt) => apt.patientId === state.currentUser?.id && apt.status === 'accepted'
  );

  const completedAppointments = state.appointments.filter(
    (apt) => apt.patientId === state.currentUser?.id && apt.status === 'completed'
  );

  const completedAppointmentsWithPrescriptions = completedAppointments.filter(
    (apt) => apt.prescription
  );

  const notifications = state.notifications.filter(
    (notif) => notif.userId === state.currentUser?.id
  );

  const handleSubmitReview = () => {
    if (reviewData) {
      dispatch({
        type: 'ADD_REVIEW',
        payload: {
          id: crypto.randomUUID(),
          doctorId: reviewData.doctorId,
          patientId: state.currentUser!.id,
          appointmentId: reviewData.appointmentId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date(),
        },
      });
      setReviewData(null);
    }
  };

  const handleBookAppointment = () => {
    if (bookingData && state.currentUser) {
      const appointment = {
        id: crypto.randomUUID(),
        doctorId: bookingData.doctorId,
        patientId: state.currentUser.id,
        date: new Date(bookingData.date),
        status: 'pending',
        proposedFee: bookingData.proposedFee,
        createdAt: new Date(),
      };

      dispatch({
        type: 'ADD_APPOINTMENT',
        payload: appointment,
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          userId: bookingData.doctorId,
          message: `New appointment request from ${state.currentUser.name}`,
          createdAt: new Date(),
          read: false,
        },
      });

      setBookingData(null);
      setSelectedDoctor(null);
      setActiveTab('pending');
    }
  };

  const filteredDoctors = state.doctors.filter(
    (doctor) =>
      doctor.isApproved &&
      (doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Find Doctors
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
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
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
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
            {completedAppointmentsWithPrescriptions.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'prescriptions' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                {completedAppointmentsWithPrescriptions.length}
              </span>
            )}
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
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, speciality, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {doctor.name}</h3>
                      <p className="text-gray-600">{doctor.speciality}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      {doctor.rating.toFixed(1)} ({state.reviews.filter(r => r.doctorId === doctor.id).length} reviews)
                    </div>
                    <p className="text-gray-600">
                      Fee Range: ${doctor.minFee} - ${doctor.maxFee}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
          {completedAppointmentsWithPrescriptions.length === 0 ? (
            <p className="text-gray-600">No prescriptions available.</p>
          ) : (
            completedAppointmentsWithPrescriptions.map((appointment) => {
              const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {doctor?.name}</h3>
                      <p className="text-gray-600">{doctor?.speciality}</p>
                      <div className="flex items-center mt-2 text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPrescription(appointment.id)}
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Prescription
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Appointments</h2>
          {pendingAppointments.length === 0 ? (
            <p className="text-gray-600">No pending appointments.</p>
          ) : (
            pendingAppointments.map((appointment) => {
              const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {doctor?.name}</h3>
                      <p className="text-gray-600">{doctor?.speciality}</p>
                      <div className="flex items-center mt-2 text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleString()}
                      </div>
                      <p className="mt-2">Proposed Fee: ${appointment.proposedFee}</p>
                      <span className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Approved Appointments</h2>
          {approvedAppointments.length === 0 ? (
            <p className="text-gray-600">No approved appointments.</p>
          ) : (
            approvedAppointments.map((appointment) => {
              const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {doctor?.name}</h3>
                      <p className="text-gray-600">{doctor?.speciality}</p>
                      <div className="flex items-center mt-2 text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleString()}
                      </div>
                      <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                    </div>
                    <button
                      onClick={() => setSelectedChat(doctor?.id || null)}
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Doctor
                    </button>
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
              const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
              const review = state.reviews.find(
                (r) => r.appointmentId === appointment.id
              );
              const messages = state.messages.filter(
                (msg) =>
                  (msg.senderId === state.currentUser?.id && msg.receiverId === doctor?.id) ||
                  (msg.senderId === doctor?.id && msg.receiverId === state.currentUser?.id)
              );
              
              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">Dr. {doctor?.name}</h3>
                      <p className="text-gray-600">{doctor?.speciality}</p>
                      <div className="flex items-center mt-2 text-gray-600">
                        <History className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleString()}
                      </div>
                      <p className="mt-2">Fee: ${appointment.proposedFee}</p>
                      
                      {review ? (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold mr-2">Your Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewData({
                            appointmentId: appointment.id,
                            doctorId: appointment.doctorId,
                            rating: 5,
                            comment: ''
                          })}
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Leave Review
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      {appointment.prescription && (
                        <button
                          onClick={() => setSelectedPrescription(appointment.id)}
                          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Prescription
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedChat(doctor?.id || null)}
                        className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Chat History
                        {messages.length > 0 && (
                          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">
                            {messages.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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

      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chat History</h3>
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

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Prescription Details</h3>
              <button 
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {(() => {
                const appointment = completedAppointments.find(
                  apt => apt.id === selectedPrescription
                );
                const doctor = state.doctors.find(
                  d => d.id === appointment?.doctorId
                );
                const patient = state.users.find(
                  u => u.id === appointment?.patientId
                );

                if (appointment?.prescription && doctor && patient) {
                  return (
                    <PrescriptionView
                      prescription={appointment.prescription}
                      doctorName={doctor.name}
                      patientName={patient.name}
                    />
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Book Appointment with Dr. {selectedDoctor.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setBookingData({
                      doctorId: selectedDoctor.id,
                      date: e.target.value,
                      proposedFee: bookingData?.proposedFee || selectedDoctor.minFee,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Fee (${selectedDoctor.minFee} - ${selectedDoctor.maxFee})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min={selectedDoctor.minFee}
                    max={selectedDoctor.maxFee}
                    value={bookingData?.proposedFee || selectedDoctor.minFee}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData!,
                        doctorId: selectedDoctor.id,
                        proposedFee: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBookAppointment}
                disabled={!bookingData?.date || !bookingData?.proposedFee}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setBookingData(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewData({ ...reviewData, rating })}
                    className={`text-2xl ${
                      rating <= reviewData.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                onClick={() => setReviewData(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}