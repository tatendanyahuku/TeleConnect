import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Doctor, Patient, Appointment, Review, Message, Notification } from '../types';

// Add some dummy doctors
const dummyDoctors: Doctor[] = [
  {
    id: '1',
    email: 'dr.smith@example.com',
    password: 'password123',
    role: 'doctor',
    name: 'Dr. John Smith',
    speciality: 'Cardiologist',
    location: 'New York',
    bio: 'Experienced cardiologist with 15 years of practice',
    minFee: 20,
    maxFee: 50,
    rating: 4.8,
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'dr.jones@example.com',
    password: 'password123',
    role: 'doctor',
    name: 'Dr. Sarah Jones',
    speciality: 'Dermatologist',
    location: 'Los Angeles',
    bio: 'Board-certified dermatologist specializing in cosmetic procedures',
    minFee: 15,
    maxFee: 45,
    rating: 4.9,
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    createdAt: new Date('2024-01-02'),
  },
];

// Load initial state from localStorage or use default state
const loadInitialState = (): AppState => {
  const savedState = localStorage.getItem('healthcareAppState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Convert string dates back to Date objects
    return {
      ...parsedState,
      appointments: parsedState.appointments.map((apt: any) => ({
        ...apt,
        date: new Date(apt.date),
        createdAt: new Date(apt.createdAt),
      })),
      users: parsedState.users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })),
      doctors: parsedState.doctors.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })),
      patients: parsedState.patients.map((patient: any) => ({
        ...patient,
        createdAt: new Date(patient.createdAt),
      })),
      reviews: parsedState.reviews.map((review: any) => ({
        ...review,
        createdAt: new Date(review.createdAt),
      })),
      messages: parsedState.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
      notifications: (parsedState.notifications || []).map((notif: any) => ({
        ...notif,
        createdAt: new Date(notif.createdAt),
      })),
    };
  }
  return {
    users: dummyDoctors.map(doctor => ({
      id: doctor.id,
      email: doctor.email,
      password: doctor.password,
      role: doctor.role,
      name: doctor.name,
      createdAt: doctor.createdAt,
    })),
    doctors: dummyDoctors,
    patients: [],
    appointments: [],
    reviews: [],
    messages: [],
    notifications: [], // Initialize empty notifications array
    currentUser: null,
  };
};

const initialState = loadInitialState();

type Action =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'DELETE_DOCTOR'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_CURRENT_USER':
      newState = { ...state, currentUser: action.payload };
      break;
    case 'ADD_USER':
      newState = { ...state, users: [...state.users, action.payload] };
      break;
    case 'ADD_DOCTOR': {
      const newDoctor = { ...action.payload, isApproved: false };
      newState = { 
        ...state, 
        doctors: [...state.doctors, newDoctor],
        users: [...state.users, {
          id: newDoctor.id,
          email: newDoctor.email,
          password: newDoctor.password,
          role: newDoctor.role,
          name: newDoctor.name,
          createdAt: newDoctor.createdAt,
        }]
      };
      break;
    }
    case 'ADD_PATIENT':
      newState = { ...state, patients: [...state.patients, action.payload] };
      break;
    case 'ADD_APPOINTMENT':
      newState = { ...state, appointments: [...state.appointments, action.payload] };
      break;
    case 'UPDATE_APPOINTMENT':
      newState = {
        ...state,
        appointments: state.appointments.map((apt) =>
          apt.id === action.payload.id ? action.payload : apt
        ),
      };
      break;
    case 'ADD_REVIEW':
      newState = { ...state, reviews: [...state.reviews, action.payload] };
      break;
    case 'ADD_MESSAGE':
      newState = { ...state, messages: [...state.messages, action.payload] };
      break;
    case 'UPDATE_DOCTOR':
      newState = {
        ...state,
        doctors: state.doctors.map((doc) =>
          doc.id === action.payload.id ? action.payload : doc
        ),
      };
      break;
    case 'DELETE_DOCTOR': {
      const newDoctors = state.doctors.filter(doc => doc.id !== action.payload);
      const newUsers = state.users.filter(user => user.id !== action.payload);
      newState = {
        ...state,
        doctors: newDoctors,
        users: newUsers
      };
      break;
    }
    case 'ADD_NOTIFICATION':
      newState = {
        ...state,
        notifications: [...(state.notifications || []), action.payload]
      };
      break;
    default:
      return state;
  }

  // Save to localStorage after each state change
  localStorage.setItem('healthcareAppState', JSON.stringify(newState));
  return newState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Save initial state to localStorage
  useEffect(() => {
    localStorage.setItem('healthcareAppState', JSON.stringify(state));
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}