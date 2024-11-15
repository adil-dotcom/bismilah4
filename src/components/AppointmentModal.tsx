import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, Trash2, UserPlus, Check, Edit } from 'lucide-react';
import { format, parse, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { useAppointments } from '../contexts/AppointmentContext';
import DraggableModal from './DraggableModal';
import PatientModal from './PatientModal';
import { APPOINTMENT_SOURCES } from '../constants/appointmentSources';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: any) => void;
  onDelete?: (id: string) => void;
  initialDate?: Date;
  initialTime?: string;
  existingAppointment?: any;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialDate,
  initialTime,
  existingAppointment
}: AppointmentModalProps) {
  const { patients, addPatient, updatePatient } = useData();
  const { timeSlots } = useTimeSlots();
  const { isTimeSlotAvailable } = useAppointments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientModalData, setPatientModalData] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [appointment, setAppointment] = useState({
    nom: '',
    prenom: '',
    contact: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    source: APPOINTMENT_SOURCES.PHONE.id,
    amount: '',
    paymentMethod: 'Carte Bancaire',
    isGratuite: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [errors, setErrors] = useState<{nom?: string; prenom?: string}>({});

  useEffect(() => {
    if (existingAppointment) {
      const [nom, prenom] = existingAppointment.patient.split(' ');
      const appointmentDate = new Date(existingAppointment.time);
      setAppointment({
        ...existingAppointment,
        nom: nom || '',
        prenom: prenom || '',
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        amount: existingAppointment.amount || '',
        paymentMethod: existingAppointment.paymentMethod || 'Carte Bancaire',
        isGratuite: existingAppointment.isGratuite || false
      });

      const patient = patients.find(p => 
        `${p.nom} ${p.prenom}` === existingAppointment.patient
      );
      if (patient) {
        setSelectedPatient(patient);
      }
    } else if (initialDate && initialTime) {
      setAppointment(prev => ({
        ...prev,
        date: format(initialDate, 'yyyy-MM-dd'),
        time: initialTime
      }));
    }
  }, [initialDate, initialTime, existingAppointment, patients]);

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
    return nameRegex.test(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {nom?: string; prenom?: string} = {};
    
    if (!validateName(appointment.nom)) {
      newErrors.nom = 'Le nom ne doit contenir que des lettres, espaces et tirets';
    }
    
    if (!validateName(appointment.prenom)) {
      newErrors.prenom = 'Le prénom ne doit contenir que des lettres, espaces et tirets';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(appointment.contact)) {
      alert('Le numéro de téléphone doit contenir exactement 10 chiffres');
      return;
    }

    const [hours, minutes] = appointment.time.split(':').map(Number);
    let appointmentDateTime = parse(appointment.date, 'yyyy-MM-dd', new Date());
    appointmentDateTime = setHours(appointmentDateTime, hours);
    appointmentDateTime = setMinutes(appointmentDateTime, minutes);

    if (!isTimeSlotAvailable(appointmentDateTime, appointment.time, existingAppointment?.id)) {
      alert('Ce créneau horaire est déjà occupé par un autre rendez-vous');
      return;
    }

    const appointmentData = {
      ...appointment,
      patient: `${appointment.nom} ${appointment.prenom}`,
      time: appointmentDateTime.toISOString(),
      patientId: selectedPatient?.id,
      amount: appointment.isGratuite ? '0,00' : appointment.amount,
      paymentMethod: appointment.isGratuite ? '-' : appointment.paymentMethod,
      isGratuite: appointment.isGratuite
    };

    onSubmit(appointmentData);
    setAppointment({
      nom: '',
      prenom: '',
      contact: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      source: APPOINTMENT_SOURCES.PHONE.id,
      amount: '',
      paymentMethod: 'Carte Bancaire',
      isGratuite: false
    });
    setSelectedPatient(null);
    setErrors({});
    onClose();
  };

  const handleDelete = () => {
    if (existingAppointment && onDelete) {
      onDelete(existingAppointment.id);
      onClose();
    }
  };

  const handleNewPatient = () => {
    setPatientModalData({
      nom: appointment.nom,
      prenom: appointment.prenom,
      telephone: appointment.contact,
      dateRendezVous: appointment.date,
      heureRendezVous: appointment.time
    });
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      setPatientModalData({
        ...selectedPatient,
        dateRendezVous: appointment.date,
        heureRendezVous: appointment.time
      });
      setIsPatientModalOpen(true);
    }
  };

  const handleNewPatientSubmit = (patientData: any) => {
    const newPatient = {
      ...patientData,
      id: crypto.randomUUID(),
      numeroPatient: `P${(patients.length + 1).toString().padStart(3, '0')}`,
      derniereConsultation: appointment.date,
      prochainRdv: `${appointment.date} ${appointment.time}`
    };
    
    addPatient(newPatient);
    setSelectedPatient(newPatient);
    setAppointment({
      ...appointment,
      nom: newPatient.nom,
      prenom: newPatient.prenom,
      contact: newPatient.telephone
    });
    setPatientModalData(null);
    setIsPatientModalOpen(false);
  };

  const handlePatientDataUpdate = (updatedData: any) => {
    if (selectedPatient) {
      const updatedPatient = {
        ...selectedPatient,
        ...updatedData
      };
      updatePatient(selectedPatient.id, updatedPatient);
      setSelectedPatient(updatedPatient);
      setAppointment(prev => ({
        ...prev,
        nom: updatedData.nom,
        prenom: updatedData.prenom,
        contact: updatedData.telephone
      }));
    }
    setPatientModalData(null);
    setIsPatientModalOpen(false);
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setAppointment({
      ...appointment,
      nom: patient.nom,
      prenom: patient.prenom,
      contact: patient.telephone
    });
    setShowPatientSearch(false);
    setSearchTerm('');
    setErrors({});
  };

  const filteredPatients = patients.filter(patient => {
    const searchTerms = searchTerm.toLowerCase().split(' ');
    const patientFullName = `${patient.nom} ${patient.prenom}`.toLowerCase();
    
    return searchTerms.every(term => 
      patientFullName.includes(term) ||
      patient.telephone.includes(term) ||
      patient.numeroPatient.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        title={existingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        className="w-full max-w-md"
      >
        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient
                </div>
              </label>
              <button
                type="button"
                onClick={selectedPatient ? handleEditPatient : handleNewPatient}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                {selectedPatient ? (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier info patient
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Nouveau patient
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={appointment.nom}
                  onChange={(e) => {
                    setAppointment({ ...appointment, nom: e.target.value });
                    if (errors.nom && validateName(e.target.value)) {
                      setErrors({ ...errors, nom: undefined });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.nom 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="Nom"
                  required
                />
                {errors.nom && (
                  <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={appointment.prenom}
                  onChange={(e) => {
                    setAppointment({ ...appointment, prenom: e.target.value });
                    if (errors.prenom && validateName(e.target.value)) {
                      setErrors({ ...errors, prenom: undefined });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.prenom 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="Prénom"
                  required
                />
                {errors.prenom && (
                  <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                )}
              </div>
            </div>

            {showPatientSearch && filteredPatients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => selectPatient(patient)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium">{patient.nom} {patient.prenom}</div>
                    <div className="text-sm text-gray-500">
                      {patient.numeroPatient} - {patient.telephone}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact (téléphone)
                </div>
              </label>
              <input
                type="tel"
                value={appointment.contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setAppointment({ ...appointment, contact: value });
                  }
                }}
                placeholder="0612345678"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                  </div>
                </label>
                <input
                  type="date"
                  value={appointment.date}
                  onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Heure
                  </div>
                </label>
                <select
                  value={appointment.time}
                  onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source du rendez-vous</label>
              <select
                value={appointment.source}
                onChange={(e) => setAppointment({ ...appointment, source: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Object.values(APPOINTMENT_SOURCES).map((source) => (
                  <option
                    key={source.id}
                    value={source.id}
                    className={source.color}
                  >
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Montant du paiement (Dhs)
                    </label>
                    <input
                      type="text"
                      value={appointment.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,]/g, '');
                        setAppointment({ 
                          ...appointment, 
                          amount: value,
                          isGratuite: value === '0' || value === '0,00'
                        });
                      }}
                      disabled={appointment.isGratuite}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={appointment.isGratuite}
                        onChange={(e) => {
                          setAppointment({
                            ...appointment,
                            isGratuite: e.target.checked,
                            amount: e.target.checked ? '0,00' : appointment.amount,
                            paymentMethod: e.target.checked ? '-' : 'Carte Bancaire'
                          });
                        }}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Gratuité</span>
                    </label>
                  </div>
                </div>

                {!appointment.isGratuite && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Méthode de paiement
                    </label>
                    <select
                      value={appointment.paymentMethod}
                      onChange={(e) => setAppointment({ ...appointment, paymentMethod: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option>Carte Bancaire</option>
                      <option>Espèces</option>
                      <option>Virement</option>
                      <option>Chèque</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between space-x-3 pt-4">
              {existingAppointment && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="flex-1 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {existingAppointment ? 'Valider' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        )}
      </DraggableModal>

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setPatientModalData(null);
        }}
        onSubmit={handleNewPatientSubmit}
        onUpdate={handlePatientDataUpdate}
        initialData={patientModalData}
      />
    </>
  );
}