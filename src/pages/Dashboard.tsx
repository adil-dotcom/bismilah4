import React, { useMemo } from 'react';
import { CreditCard, Clock, Users, UserPlus, History, TrendingUp, TrendingDown, Calendar, Clock as ClockIcon } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ConsultationTable from '../components/dashboard/ConsultationTable';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { format, isSameDay, parseISO, startOfDay, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Filtrer les rendez-vous pour la date sélectionnée
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(apt => 
        isSameDay(parseISO(apt.time), selectedDate) &&
        !isAfter(startOfDay(selectedDate), startOfDay(new Date()))
      )
      .sort((a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime());
  }, [appointments, selectedDate]);

  // Calculs des statistiques
  const stats = useMemo(() => {
    // Séparer les rendez-vous en attente (sans patient enregistré)
    const rdvEnAttente = filteredAppointments.filter(p => 
      !p.patientId && !p.isCanceled
    );

    // Filtrer les rendez-vous avec patients enregistrés
    const rdvConfirmes = filteredAppointments.filter(p => 
      p.patientId && !p.isCanceled
    );

    const totalConsultations = filteredAppointments.length;
    
    // Nouveaux patients (uniquement parmi les rendez-vous avec patients enregistrés)
    const nouveauxPatients = rdvConfirmes.filter(p => 
      p.isNewPatient && !p.isGratuite && !p.isDelegue
    ).length;
    
    // Anciens patients (uniquement parmi les rendez-vous avec patients enregistrés)
    const anciensPatients = rdvConfirmes.filter(p => 
      !p.isNewPatient && !p.isGratuite && !p.isDelegue
    ).length;
    
    // Consultations payantes (uniquement parmi les rendez-vous avec patients enregistrés)
    const consultationsPayantes = rdvConfirmes.filter(p => 
      !p.isGratuite && !p.isDelegue &&
      parseFloat((p.amount || '0,00').replace(',', '.')) > 0
    ).length;
    
    // Gratuités (uniquement parmi les rendez-vous avec patients enregistrés)
    const consultationsGratuites = rdvConfirmes.filter(p => 
      (p.isGratuite || p.isDelegue)
    ).length;

    // Rendez-vous annulés
    const consultationsAnnulees = filteredAppointments.filter(p => 
      p.isCanceled
    ).length;

    // Calcul du revenu du jour (uniquement rendez-vous avec patients enregistrés)
    const revenueJour = rdvConfirmes
      .filter(p => !p.isGratuite && !p.isDelegue)
      .reduce((sum, p) => sum + parseFloat((p.amount || '0,00').replace(',', '.')), 0);

    // Calculer le revenu du jour précédent
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const revenueHier = appointments
      .filter(p => 
        isSameDay(parseISO(p.time), previousDay) && 
        !p.isGratuite && !p.isDelegue && !p.isCanceled &&
        p.patientId
      )
      .reduce((sum, p) => sum + parseFloat((p.amount || '0,00').replace(',', '.')), 0);

    const revenueChange = revenueHier > 0 
      ? ((revenueJour - revenueHier) / revenueHier) * 100 
      : 100;

    const dernierPaiement = rdvConfirmes
      .filter(p => !p.isGratuite && !p.isDelegue)
      .sort((a, b) => parseISO(b.time).getTime() - parseISO(a.time).getTime())[0]?.amount || '0,00';

    return {
      consultations: {
        total: totalConsultations,
        nouveauxPatients,
        anciensPatients,
        payantes: consultationsPayantes,
        gratuites: consultationsGratuites,
        annulees: consultationsAnnulees,
        enAttente: rdvEnAttente.length
      },
      revenue: {
        total: revenueJour.toFixed(2).replace('.', ','),
        change: revenueChange.toFixed(1),
        dernierPaiement
      }
    };
  }, [filteredAppointments, appointments, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Tableau de bord - {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CreditCard className="h-6 w-6 text-white" />}
          iconBgColor="bg-green-500"
          title="Facturation du jour"
        >
          <p className="mt-1 text-xl font-semibold text-gray-900">{stats.revenue.total} Dhs</p>
          <p className="mt-1 text-sm text-gray-600">
            Dernier paiement: {stats.revenue.dernierPaiement} Dhs
          </p>
          <div className="flex items-center mt-1">
            {parseFloat(stats.revenue.change) > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-sm text-green-600">+{stats.revenue.change}%</p>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-sm text-red-600">{stats.revenue.change}%</p>
              </>
            )}
            <span className="text-sm text-gray-500 ml-2">vs. hier</span>
          </div>
        </StatCard>

        <StatCard
          icon={<Clock className="h-6 w-6 text-white" />}
          iconBgColor="bg-blue-500"
          title="Consultations payantes"
        >
          <p className="mt-1 text-xl font-semibold text-gray-900">{stats.consultations.payantes}</p>
          <p className="mt-1 text-sm text-blue-600">
            {stats.consultations.total > 0 
              ? `${((stats.consultations.payantes / stats.consultations.total) * 100).toFixed(0)}% du total`
              : '0% du total'
            }
          </p>
          <p className="text-sm text-gray-500">
            {stats.consultations.payantes} sur {stats.consultations.total} consultations
          </p>
        </StatCard>

        <StatCard
          icon={<Users className="h-6 w-6 text-white" />}
          iconBgColor="bg-purple-500"
          title="Statistiques de Consultation"
        >
          <p className="mt-1 text-xl font-semibold text-gray-900">
            Total: {stats.consultations.total}
          </p>
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 mr-1" />
                <span>Nouveaux patients</span>
              </div>
              <span>{stats.consultations.nouveauxPatients}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <History className="h-4 w-4 mr-1" />
                <span>Anciens patients</span>
              </div>
              <span>{stats.consultations.anciensPatients}</span>
            </div>
            <hr className="my-1" />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Gratuités</span>
              <span>{stats.consultations.gratuites}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Rendez-vous annulés</span>
              <span>{stats.consultations.annulees}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Rendez-vous en attente</span>
              </div>
              <span>{stats.consultations.enAttente}</span>
            </div>
          </div>
        </StatCard>
      </div>

      <ConsultationTable visits={filteredAppointments} />
    </div>
  );
}