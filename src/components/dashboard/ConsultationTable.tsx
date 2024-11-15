import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Check, X, AlertCircle } from 'lucide-react';
import { formatters } from '../../utils/formatters';
import PatientInfoDisplay from '../PatientInfoDisplay';

interface Visit {
  time: string;
  patient: string;
  amount: string;
  paid: boolean;
  paymentMethod: string;
  isDelegue: boolean;
  isGratuite: boolean;
  isNewPatient: boolean;
  isCanceled: boolean;
  patientNumber: string;
  lastConsultAmount: string;
}

interface ConsultationTableProps {
  visits: Visit[];
}

export default function ConsultationTable({ visits }: ConsultationTableProps) {
  const getPatientNames = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      nom: parts[0] || '',
      prenom: parts.slice(1).join(' ') || ''
    };
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Consultations du {new Date().toLocaleDateString('fr-FR')}
          </h3>
          <Link
            to="/appointments"
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            Voir l'agenda
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ancien patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant dernière consultation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paiement
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit, index) => {
              const { nom, prenom } = getPatientNames(visit.patient);
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatters.patientNumber(visit.patientNumber)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visit.isNewPatient && (
                        <UserPlus className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <PatientInfoDisplay 
                        patient={{
                          numeroPatient: visit.patientNumber,
                          nom,
                          prenom,
                          telephone: '',
                          ville: '',
                          cin: '',
                          dateNaissance: ''
                        }}
                        compact
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {!visit.isNewPatient ? 'Oui' : 'Non'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatters.amount(visit.lastConsultAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatters.amount(visit.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visit.isCanceled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="h-4 w-4 mr-1" />
                        Annulé
                      </span>
                    ) : visit.isGratuite || visit.isDelegue ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Check className="h-4 w-4 mr-1" />
                        Gratuit
                      </span>
                    ) : visit.paid ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-4 w-4 mr-1" />
                        Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {visit.isGratuite || visit.isDelegue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Gratuit
                        </span>
                      ) : visit.paid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {visit.paymentMethod}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          En attente
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}