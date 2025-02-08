export type UserRole = 'doctor' | 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: Date;
}

export interface Doctor extends User {
  speciality: string;
  location: string;
  bio: string;
  minFee: number;
  maxFee: number;
  rating: number;
  isApproved: boolean;
}

export interface Patient extends User {
  medicalHistory?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  proposedFee: number;
  finalFee?: number;
  createdAt: Date;
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  type: 'text' | 'video-offer' | 'video-answer' | 'video-candidate';
  videoData?: any;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface AppState {
  users: User[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  reviews: Review[];
  messages: Message[];
  notifications: Notification[];
  currentUser: User | null;
}