import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { testPatients, testAppointments, testSupplies, testAbsences, testUsers } from '../data/testData';

// Types
interface Patient {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  ville: string;
  secteur?: string;
  cin: string;
  dateNaissance: string;
  age: string;
  mutuelle: {
    active: boolean;
    nom: string;
  };
  antecedents: string[];
  derniereConsultation: string;
  prochainRdv: string;
  nombreConsultations: number;
}

interface Appointment {
  id: string;
  patientId: string;
  patient: string;
  time: string;
  duration: string;
  type: string;
  source: string;
  status: string;
  contact?: string;
  location?: string;
  videoLink?: string;
  amount: string;
  paid: boolean;
  paymentMethod: string;
  isDelegue: boolean;
  isGratuite: boolean;
  isNewPatient: boolean;
  isControl: boolean;
  isCanceled: boolean;
  lastConsultAmount: string;
  mutuelle?: {
    active: boolean;
    nom: string;
  };
}

interface Supply {
  id: string;
  item: string;
  dateAchat: string;
  facture: boolean;
  prix: string;
  typePaiement: string;
  taxe: string;
}

interface Absence {
  id: string;
  employee: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  specialite?: string;
  dateCreation: string;
  failedAttempts: number;
  isBlocked: boolean;
}

interface DataContextType {
  // Data
  patients: Patient[];
  appointments: Appointment[];
  supplies: Supply[];
  absences: Absence[];
  users: User[];

  // Patient methods
  addPatient: (patient: Omit<Patient, 'id' | 'numeroPatient'>) => string;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;

  // Appointment methods
  addAppointment: (appointment: Omit<Appointment, 'id'>) => string;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;

  // Supply methods
  addSupply: (supply: Omit<Supply, 'id'>) => string;
  updateSupply: (id: string, supply: Partial<Supply>) => void;
  deleteSupply: (id: string) => void;

  // Absence methods
  addAbsence: (absence: Omit<Absence, 'id'>) => string;
  updateAbsence: (id: string, absence: Partial<Absence>) => void;
  deleteAbsence: (id: string) => void;

  // User methods
  addUser: (user: Omit<User, 'id' | 'dateCreation' | 'failedAttempts' | 'isBlocked'>) => string;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserFailedAttempts: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(testPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(testAppointments);
  const [supplies, setSupplies] = useState<Supply[]>(testSupplies);
  const [absences, setAbsences] = useState<Absence[]>(testAbsences);
  const [users, setUsers] = useState<User[]>(testUsers);

  // Patient methods
  const addPatient = (patientData: Omit<Patient, 'id' | 'numeroPatient'>) => {
    const id = crypto.randomUUID();
    const numeroPatient = `P${(patients.length + 1).toString().padStart(3, '0')}`;
    
    const newPatient: Patient = {
      ...patientData,
      id,
      numeroPatient,
      derniereConsultation: format(new Date(), 'dd/MM/yyyy'),
      prochainRdv: '-',
      nombreConsultations: 0
    };

    setPatients(prev => [...prev, newPatient]);
    return id;
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, ...patientData } : patient
    ));

    // Mettre à jour les rendez-vous associés si nécessaire
    if (patientData.nom || patientData.prenom || patientData.telephone || patientData.mutuelle) {
      setAppointments(prev => prev.map(apt => {
        if (apt.patientId === id) {
          const updatedApt: Partial<Appointment> = {};
          if (patientData.nom || patientData.prenom) {
            const patient = patients.find(p => p.id === id);
            updatedApt.patient = `${patientData.nom || patient?.nom} ${patientData.prenom || patient?.prenom}`;
          }
          if (patientData.telephone) {
            updatedApt.contact = patientData.telephone;
          }
          if (patientData.mutuelle) {
            updatedApt.mutuelle = patientData.mutuelle;
          }
          return { ...apt, ...updatedApt };
        }
        return apt;
      }));
    }
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
    setAppointments(prev => prev.filter(apt => apt.patientId !== id));
  };

  const getPatientById = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  // Appointment methods
  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const id = crypto.randomUUID();
    const newAppointment: Appointment = {
      ...appointmentData,
      id
    };

    setAppointments(prev => [...prev, newAppointment]);

    // Mettre à jour les informations du patient
    if (appointmentData.patientId) {
      setPatients(prev => prev.map(patient => {
        if (patient.id === appointmentData.patientId) {
          return {
            ...patient,
            nombreConsultations: patient.nombreConsultations + 1,
            derniereConsultation: format(new Date(appointmentData.time), 'dd/MM/yyyy'),
            prochainRdv: format(new Date(appointmentData.time), 'dd/MM/yyyy HH:mm')
          };
        }
        return patient;
      }));
    }

    return id;
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, ...appointmentData } : apt
    ));

    // Mettre à jour les informations du patient si nécessaire
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment && appointmentData.time) {
      setPatients(prev => prev.map(patient => {
        if (patient.id === appointment.patientId) {
          return {
            ...patient,
            prochainRdv: format(new Date(appointmentData.time), 'dd/MM/yyyy HH:mm')
          };
        }
        return patient;
      }));
    }
  };

  const deleteAppointment = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    setAppointments(prev => prev.filter(apt => apt.id !== id));

    if (appointment?.patientId) {
      setPatients(prev => prev.map(patient => {
        if (patient.id === appointment.patientId) {
          return {
            ...patient,
            nombreConsultations: Math.max(0, patient.nombreConsultations - 1)
          };
        }
        return patient;
      }));
    }
  };

  const getAppointmentById = (id: string) => {
    return appointments.find(apt => apt.id === id);
  };

  // Supply methods
  const addSupply = (supplyData: Omit<Supply, 'id'>) => {
    const id = crypto.randomUUID();
    const newSupply: Supply = {
      ...supplyData,
      id
    };
    setSupplies(prev => [...prev, newSupply]);
    return id;
  };

  const updateSupply = (id: string, supplyData: Partial<Supply>) => {
    setSupplies(prev => prev.map(supply => 
      supply.id === id ? { ...supply, ...supplyData } : supply
    ));
  };

  const deleteSupply = (id: string) => {
    setSupplies(prev => prev.filter(supply => supply.id !== id));
  };

  // Absence methods
  const addAbsence = (absenceData: Omit<Absence, 'id'>) => {
    const id = crypto.randomUUID();
    const newAbsence: Absence = {
      ...absenceData,
      id
    };
    setAbsences(prev => [...prev, newAbsence]);
    return id;
  };

  const updateAbsence = (id: string, absenceData: Partial<Absence>) => {
    setAbsences(prev => prev.map(absence => 
      absence.id === id ? { ...absence, ...absenceData } : absence
    ));
  };

  const deleteAbsence = (id: string) => {
    setAbsences(prev => prev.filter(absence => absence.id !== id));
  };

  // User methods
  const addUser = (userData: Omit<User, 'id' | 'dateCreation' | 'failedAttempts' | 'isBlocked'>) => {
    const id = crypto.randomUUID();
    const newUser: User = {
      ...userData,
      id,
      dateCreation: format(new Date(), 'dd/MM/yyyy'),
      failedAttempts: 0,
      isBlocked: false
    };
    setUsers(prev => [...prev, newUser]);
    return id;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const resetUserFailedAttempts = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, failedAttempts: 0, isBlocked: false } : user
    ));
  };

  const blockUser = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isBlocked: true } : user
    ));
  };

  const unblockUser = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isBlocked: false, failedAttempts: 0 } : user
    ));
  };

  return (
    <DataContext.Provider value={{
      // Data
      patients,
      appointments,
      supplies,
      absences,
      users,

      // Methods
      addPatient,
      updatePatient,
      deletePatient,
      getPatientById,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentById,
      addSupply,
      updateSupply,
      deleteSupply,
      addAbsence,
      updateAbsence,
      deleteAbsence,
      addUser,
      updateUser,
      deleteUser,
      resetUserFailedAttempts,
      blockUser,
      unblockUser
    }}>
      {children}
    </DataContext.Provider>
  );
}