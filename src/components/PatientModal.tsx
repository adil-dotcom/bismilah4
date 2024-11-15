import React, { useState, useEffect } from 'react';
import { X, User, Lock, Eye, EyeOff, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: any) => void;
  onUpdate?: (patient: any) => void;
  onDelete?: (patientId: string) => void;
  initialData?: any;
}

export default function PatientModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onUpdate,
  onDelete,
  initialData 
}: PatientModalProps) {
  const { deletePatient } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patient, setPatient] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    ville: '',
    secteur: '',
    cin: '',
    dateNaissance: '',
    mutuelle: {
      active: false,
      nom: ''
    },
    antecedents: [],
    newAntecedent: '',
    customAntecedent: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [savedAntecedents, setSavedAntecedents] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedAntecedents');
    return saved ? JSON.parse(saved) : [
      'Diabète',
      'Hypertension',
      'Asthme',
      'Allergie',
      'Dépression',
      'Anxiété'
    ];
  });

  const [savedMutuelles] = useState<string[]>([
    'CNOPS',
    'CNSS',
    'RMA',
    'SAHAM',
    'AXA'
  ]);

  const [savedSecteurs] = useState<string[]>([
    'Guéliz',
    'Hivernage',
    'Médina',
    'Targa',
    'Semlalia',
    'M\'hamid',
    'Massira',
    'Sidi Ghanem'
  ]);

  // Mettre à jour les données du patient quand initialData change
  useEffect(() => {
    if (initialData) {
      setPatient(prevPatient => ({
        ...prevPatient,
        nom: initialData.nom || prevPatient.nom,
        prenom: initialData.prenom || prevPatient.prenom,
        telephone: initialData.telephone || prevPatient.telephone,
        email: initialData.email || prevPatient.email,
        ville: initialData.ville || prevPatient.ville,
        secteur: initialData.secteur || prevPatient.secteur,
        cin: initialData.cin || prevPatient.cin,
        dateNaissance: initialData.dateNaissance || prevPatient.dateNaissance,
        mutuelle: {
          active: initialData.mutuelle?.active ?? prevPatient.mutuelle.active,
          nom: initialData.mutuelle?.nom || prevPatient.mutuelle.nom
        },
        antecedents: initialData.antecedents || prevPatient.antecedents
      }));
    }
  }, [initialData]);

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
    return nameRegex.test(name);
  };

  const validateDateOfBirth = (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (birthDate > today) {
      return false;
    }

    return age >= 12 && age <= 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    const cinRegex = /^[A-Za-z0-9]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!validateName(patient.nom)) {
      newErrors.nom = 'Le nom ne doit contenir que des lettres, espaces et tirets';
    }
    
    if (!validateName(patient.prenom)) {
      newErrors.prenom = 'Le prénom ne doit contenir que des lettres, espaces et tirets';
    }

    if (!cinRegex.test(patient.cin)) {
      newErrors.cin = 'Le CIN doit contenir uniquement des lettres et des chiffres';
    }

    if (!phoneRegex.test(patient.telephone)) {
      newErrors.telephone = 'Le numéro de téléphone doit contenir exactement 10 chiffres';
    }

    if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!validateDateOfBirth(patient.dateNaissance)) {
      newErrors.dateNaissance = 'La date de naissance doit correspondre à un âge entre 12 et 100 ans';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const patientData = {
      ...patient,
      ville: patient.ville.trim(),
      secteur: patient.ville.toLowerCase() === 'marrakech' ? patient.secteur : ''
    };

    if (onUpdate && initialData?.id) {
      onUpdate(patientData);
    } else {
      onSubmit(patientData);
    }
  };

  const handleDelete = () => {
    if (initialData?.id) {
      if (onDelete) {
        onDelete(initialData.id);
      } else {
        deletePatient(initialData.id);
      }
      onClose();
    }
  };

  const addAntecedent = () => {
    const antecedentToAdd = patient.customAntecedent || patient.newAntecedent;
    if (antecedentToAdd.trim()) {
      // Add to saved antecedents if it's a custom one
      if (patient.customAntecedent && !savedAntecedents.includes(patient.customAntecedent)) {
        const newSavedAntecedents = [...savedAntecedents, patient.customAntecedent];
        setSavedAntecedents(newSavedAntecedents);
        localStorage.setItem('savedAntecedents', JSON.stringify(newSavedAntecedents));
      }

      setPatient({
        ...patient,
        antecedents: [...patient.antecedents, antecedentToAdd.trim()],
        newAntecedent: '',
        customAntecedent: ''
      });
    }
  };

  const removeAntecedent = (index: number) => {
    setPatient({
      ...patient,
      antecedents: patient.antecedents.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Confirmer la suppression
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Êtes-vous sûr de vouloir supprimer définitivement ce patient ? Cette action est irréversible et supprimera également tous les rendez-vous associés.
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
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Modifier le patient' : 'Nouveau patient'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={patient.nom}
                onChange={(e) => {
                  setPatient({...patient, nom: e.target.value});
                  if (errors.nom && validateName(e.target.value)) {
                    setErrors({...errors, nom: undefined});
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.nom 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              />
              {errors.nom && (
                <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                value={patient.prenom}
                onChange={(e) => {
                  setPatient({...patient, prenom: e.target.value});
                  if (errors.prenom && validateName(e.target.value)) {
                    setErrors({...errors, prenom: undefined});
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.prenom 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              />
              {errors.prenom && (
                <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={patient.telephone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setPatient({...patient, telephone: value});
                    if (errors.telephone && /^\d{10}$/.test(value)) {
                      setErrors({...errors, telephone: undefined});
                    }
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.telephone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="0612345678"
                required
              />
              {errors.telephone && (
                <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={patient.email}
                onChange={(e) => {
                  setPatient({...patient, email: e.target.value});
                  if (errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                    setErrors({...errors, email: undefined});
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ville</label>
              <input
                type="text"
                value={patient.ville}
                onChange={(e) => setPatient({...patient, ville: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            {patient.ville.toLowerCase() === 'marrakech' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Secteur</label>
                <select
                  value={patient.secteur}
                  onChange={(e) => setPatient({...patient, secteur: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un secteur</option>
                  {savedSecteurs.map((secteur) => (
                    <option key={secteur} value={secteur}>{secteur}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">CIN</label>
              <input
                type="text"
                value={patient.cin}
                onChange={(e) => {
                  setPatient({...patient, cin: e.target.value});
                  if (errors.cin && /^[A-Za-z0-9]+$/.test(e.target.value)) {
                    setErrors({...errors, cin: undefined});
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.cin 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              />
              {errors.cin && (
                <p className="mt-1 text-xs text-red-600">{errors.cin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <input
                type="date"
                value={patient.dateNaissance}
                onChange={(e) => {
                  setPatient({...patient, dateNaissance: e.target.value});
                  if (errors.dateNaissance && validateDateOfBirth(e.target.value)) {
                    setErrors({...errors, dateNaissance: undefined});
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.dateNaissance 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              />
              {errors.dateNaissance && (
                <p className="mt-1 text-xs text-red-600">{errors.dateNaissance}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={patient.mutuelle.active}
                  onChange={(e) => setPatient({
                    ...patient,
                    mutuelle: {
                      ...patient.mutuelle,
                      active: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Mutuelle</span>
              </label>
              {patient.mutuelle.active && (
                <div className="mt-2">
                  <select
                    value={patient.mutuelle.nom}
                    onChange={(e) => setPatient({
                      ...patient,
                      mutuelle: {
                        ...patient.mutuelle,
                        nom: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner une mutuelle</option>
                    {savedMutuelles.map((mutuelle) => (
                      <option key={mutuelle} value={mutuelle}>{mutuelle}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Antécédents médicaux</label>
              <div className="flex space-x-2 mb-2">
                <select
                  value={patient.newAntecedent}
                  onChange={(e) => setPatient({...patient, newAntecedent: e.target.value})}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un antécédent</option>
                  {savedAntecedents.map((antecedent) => (
                    <option key={antecedent} value={antecedent}>{antecedent}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={patient.customAntecedent}
                  onChange={(e) => setPatient({...patient, customAntecedent: e.target.value})}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAntecedent();
                    }
                  }}
                  className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ou saisir un nouvel antécédent..."
                />
                <button
                  type="button"
                  onClick={addAntecedent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {patient.antecedents.map((antecedent: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{antecedent}</span>
                    <button
                      type="button"
                      onClick={() => removeAntecedent(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-3 pt-4">
            {initialData && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            )}
            <div className="flex space-x-3">
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
                {initialData ? 'Valider' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}