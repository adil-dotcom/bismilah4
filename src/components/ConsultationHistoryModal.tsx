import React from 'react';
import { X, Calendar, Clock, CreditCard, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatters } from '../utils/formatters';

interface ConsultationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    nom: string;
    prenom: string;
    consultations: Array<{
      date: string;
      type: string;
      montant: string;
      status?: string;
      paymentMethod?: string;
      hasFicheConsultation?: boolean;
    }>;
  };
}

export default function ConsultationHistoryModal({
  isOpen,
  onClose,
  patient
}: ConsultationHistoryModalProps) {
  if (!isOpen) return null;

  const totalAmount = patient.consultations.reduce((sum, consultation) => {
    const amount = parseFloat(consultation.montant.replace(',', '.'));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const handleFicheClick = (consultation: any) => {
    // Logique pour afficher/télécharger la fiche de consultation
    console.log('Afficher la fiche de consultation:', consultation);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Historique des consultations
            </h3>
            <p className="text-sm text-gray-500">
              {patient.nom} {patient.prenom} - {patient.consultations.length} consultation{patient.consultations.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {patient.consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Calendar className="h-12 w-12 mb-2" />
              <p>Aucune consultation</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date et heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiche
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.consultations.map((consultation, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {format(parseISO(consultation.date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-900">
                          {format(parseISO(consultation.date), 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatters.amount(consultation.montant)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFicheClick(consultation)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Fiche de consultation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {patient.consultations.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between bg-gray-50 px-6 py-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              Total des consultations
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatters.amount(totalAmount.toFixed(2).replace('.', ','))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}