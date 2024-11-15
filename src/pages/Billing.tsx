import React, { useState, useMemo } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useData } from '../contexts/DataContext';
import { formatters } from '../utils/formatters';
import { parseISO, differenceInDays, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Billing() {
  const { hasPermission } = useAuth();
  const { appointments, updateAppointment } = useAppointments();
  const { patients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    [key: string]: {
      amount: string;
      status: string;
      paymentMethod: string;
      mutuelle: { active: boolean; nom: string };
    };
  }>({});

  const paidAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        return patient !== undefined; // Ne garde que les rendez-vous avec des patients existants
      })
      .map(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        return {
          ...apt,
          patientDetails: patient
        };
      })
      .sort((a, b) => parseISO(b.time).getTime() - parseISO(a.time).getTime());
  }, [appointments, patients]);

  const filteredAppointments = useMemo(() => {
    return paidAppointments.filter(apt => {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      
      const searchableContent = [
        apt.patientDetails?.numeroPatient,
        apt.patientDetails?.nom,
        apt.patientDetails?.prenom,
        apt.amount,
        apt.status,
        apt.paymentMethod,
        apt.mutuelle?.nom
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchTerms.every(term => {
        if (term.startsWith('*') && term.endsWith('*')) {
          const searchPattern = term.slice(1, -1).toLowerCase();
          return searchPattern ? searchableContent.includes(searchPattern) : true;
        }
        return searchableContent.includes(term);
      });
      
      if (!dateRange.startDate || !dateRange.endDate) return matchesSearch;

      const aptDate = parseISO(apt.time);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const matchesDate = aptDate >= start && aptDate <= end;
      
      return matchesSearch && matchesDate;
    });
  }, [paidAppointments, searchTerm, dateRange]);

  const calculateReductionRate = (amount: number) => {
    if (amount === 0) return 0;
    const reduction = ((400 - amount) / 400) * 100;
    return Math.round(reduction);
  };

  const getInitialStatus = (amount: string | undefined) => {
    if (!amount || amount === '0' || amount === '0,00') return '-';
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (numAmount === 0) return '-';
    if (numAmount < 400) return `Réduction (${calculateReductionRate(numAmount)}%)`;
    return 'Payé';
  };

  const handleEdit = (appointmentId: string) => {
    const appointment = paidAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setEditingAppointment(appointmentId);
      setEditValues({
        [appointmentId]: {
          amount: appointment.amount || '',
          status: appointment.status || getInitialStatus(appointment.amount),
          paymentMethod: appointment.paymentMethod || '-',
          mutuelle: appointment.mutuelle || { active: false, nom: '' }
        }
      });
    }
  };

  const handleSave = (appointmentId: string) => {
    const editValue = editValues[appointmentId];
    if (editValue) {
      const amount = parseFloat(editValue.amount.replace(',', '.') || '0');
      let status = editValue.status;
      let paymentMethod = editValue.paymentMethod;

      if (!editValue.amount || amount === 0) {
        status = '-';
        paymentMethod = '-';
      } else if (amount < 400) {
        const reductionRate = calculateReductionRate(amount);
        status = `Réduction (${reductionRate}%)`;
      } else {
        status = 'Payé';
      }

      updateAppointment(appointmentId, {
        amount: amount === 0 ? '' : editValue.amount,
        status,
        paymentMethod,
        mutuelle: editValue.mutuelle
      });
      setEditingAppointment(null);
    }
  };

  const handleAmountKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.key === 'Enter') {
      handleSave(appointmentId);
    }
  };

  const formatLastConsultation = (lastConsultAmount: string, consultationDate: string) => {
    if (!lastConsultAmount || lastConsultAmount === '0' || lastConsultAmount === '0,00') {
      return '-';
    }

    const date = parseISO(consultationDate);
    const now = new Date();
    const monthsDiff = differenceInMonths(now, date);
    const daysDiff = differenceInDays(now, date);

    if (monthsDiff < 1) {
      if (daysDiff <= 1) {
        return `${formatters.amount(lastConsultAmount)} - depuis 1 jour`;
      } else {
        return `${formatters.amount(lastConsultAmount)} - depuis ${daysDiff} jours`;
      }
    } else if (monthsDiff === 1) {
      return `${formatters.amount(lastConsultAmount)} - depuis 1 mois`;
    } else {
      return `${formatters.amount(lastConsultAmount)} - depuis ${monthsDiff} mois`;
    }
  };

  const formatPatientName = (nom?: string, prenom?: string) => {
    if (!nom || !prenom) return '';
    return `${nom.toUpperCase()} ${prenom.charAt(0).toUpperCase()}${prenom.slice(1).toLowerCase()}`;
  };

  const formatAmount = (amount: string | undefined) => {
    if (!amount || amount === '0' || amount === '0,00') return '-';
    return formatters.amount(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
        {hasPermission('export_data') && (
          <button
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher (utilisez * pour une recherche partielle)..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
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
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mutuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière consultation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const isEditing = editingAppointment === appointment.id;
                const editValue = editValues[appointment.id] || {
                  amount: appointment.amount || '',
                  status: appointment.status || getInitialStatus(appointment.amount),
                  paymentMethod: appointment.paymentMethod || '-',
                  mutuelle: appointment.mutuelle || { active: false, nom: '' }
                };

                const amount = parseFloat(editValue.amount.replace(',', '.') || '0');
                const isGratuit = editValue.status === 'Gratuit';
                const isNonPaye = editValue.status === 'Non payé';
                const isReduction = amount > 0 && amount < 400;

                return (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatters.patientNumber(appointment.patientDetails?.numeroPatient)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPatientName(appointment.patientDetails?.nom, appointment.patientDetails?.prenom)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue.amount}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [appointment.id]: { ...editValue, amount: e.target.value }
                          })}
                          onKeyPress={(e) => handleAmountKeyPress(e, appointment.id)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                        />
                      ) : (
                        formatAmount(appointment.amount)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing && amount === 0 ? (
                        <select
                          value={editValue.status}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [appointment.id]: { ...editValue, status: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="-">-</option>
                          <option value="Gratuit">Gratuit</option>
                          <option value="Non payé">Non payé</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isGratuit 
                            ? 'bg-gray-100 text-gray-800'
                            : isNonPaye
                              ? 'bg-red-100 text-red-800'
                              : isReduction
                                ? 'bg-yellow-100 text-yellow-800'
                                : amount > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isGratuit 
                            ? 'Gratuit' 
                            : isNonPaye
                              ? 'Non payé'
                              : isReduction 
                                ? `Réduction (${calculateReductionRate(amount)}%)`
                                : amount > 0
                                  ? 'Payé'
                                  : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing && amount > 0 ? (
                        <select
                          value={editValue.paymentMethod}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [appointment.id]: { ...editValue, paymentMethod: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="-">-</option>
                          <option>Carte Bancaire</option>
                          <option>Espèces</option>
                          <option>Virement</option>
                          <option>Chèque</option>
                        </select>
                      ) : (
                        appointment.paymentMethod || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editValue.mutuelle.active}
                              onChange={(e) => setEditValues({
                                ...editValues,
                                [appointment.id]: {
                                  ...editValue,
                                  mutuelle: {
                                    ...editValue.mutuelle,
                                    active: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300 text-indigo-600"
                            />
                            <span className="ml-2 text-sm">Active</span>
                          </label>
                          {editValue.mutuelle.active && (
                            <select
                              value={editValue.mutuelle.nom}
                              onChange={(e) => setEditValues({
                                ...editValues,
                                [appointment.id]: {
                                  ...editValue,
                                  mutuelle: {
                                    ...editValue.mutuelle,
                                    nom: e.target.value
                                  }
                                }
                              })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Sélectionner...</option>
                              <option>CNOPS</option>
                              <option>CNSS</option>
                              <option>RMA</option>
                              <option>SAHAM</option>
                            </select>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.mutuelle?.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.mutuelle?.active ? `Oui - ${appointment.mutuelle.nom}` : 'Non'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatLastConsultation(appointment.lastConsultAmount, appointment.time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(appointment.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Enregistrer
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(appointment.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifier
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}