import { useMemo } from 'react';

export const useAppointmentColors = () => {
  // Couleurs vives pour les types de consultation (tons chauds)
  const typeColors = useMemo(() => ({
    'thérapie': 'bg-red-500 text-white',
    'urgence': 'bg-orange-500 text-white',
    'gratuit': 'bg-amber-500 text-white',
    'délégué': 'bg-yellow-500 text-white',
    'nouvelle consultation': 'bg-rose-500 text-white',
    'suivi': 'bg-pink-500 text-white'
  }), []);

  // Couleurs vives pour les sources (tons froids)
  const sourceColors = useMemo(() => ({
    'téléphone': 'bg-blue-500 text-white',
    'recommandation': 'bg-indigo-500 text-white',
    'site-satli': 'bg-violet-500 text-white',
    'email': 'bg-purple-500 text-white',
    'réseaux sociaux': 'bg-cyan-500 text-white',
    'visite directe': 'bg-teal-500 text-white',
    'site web': 'bg-emerald-500 text-white',
    'référé': 'bg-green-500 text-white',
    'publicité': 'bg-lime-500 text-white',
    'sms': 'bg-sky-500 text-white'
  }), []);

  const getAppointmentColor = (type: string | undefined, source: string | undefined, isPastDate: boolean) => {
    if (!type && !source) return 'bg-gray-500 text-white';

    if (isPastDate) {
      const normalizedSource = source?.toLowerCase();
      return sourceColors[normalizedSource as keyof typeof sourceColors] || 'bg-gray-500 text-white';
    } else {
      const normalizedType = type?.toLowerCase();
      return typeColors[normalizedType as keyof typeof typeColors] || 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmé':
        return 'bg-green-500 text-white';
      case 'en-attente':
        return 'bg-yellow-500 text-white';
      case 'annulé':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return {
    typeColors,
    sourceColors,
    getAppointmentColor,
    getStatusColor
  };
};