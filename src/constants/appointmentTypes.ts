export const APPOINTMENT_TYPES = {
  THERAPY: {
    id: 'therapy',
    label: 'Thérapie',
    color: 'bg-purple-100 text-purple-800',
    hoverColor: 'hover:bg-purple-200'
  },
  EMERGENCY: {
    id: 'emergency',
    label: 'Urgence',
    color: 'bg-red-100 text-red-800',
    hoverColor: 'hover:bg-red-200'
  },
  FREE: {
    id: 'free',
    label: 'Gratuit',
    color: 'bg-gray-100 text-gray-800',
    hoverColor: 'hover:bg-gray-200'
  },
  DELEGATE: {
    id: 'delegate',
    label: 'Délégué',
    color: 'bg-yellow-100 text-yellow-800',
    hoverColor: 'hover:bg-yellow-200'
  },
  NEW_CONSULTATION: {
    id: 'new_consultation',
    label: 'Nouvelle consultation',
    color: 'bg-green-100 text-green-800',
    hoverColor: 'hover:bg-green-200'
  },
  FOLLOW_UP: {
    id: 'follow_up',
    label: 'Suivi',
    color: 'bg-blue-100 text-blue-800',
    hoverColor: 'hover:bg-blue-200'
  }
} as const;