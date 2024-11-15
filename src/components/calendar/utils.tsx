import React from 'react';
import { Phone, Globe, User, Mail, Share2, MessageSquare, Users, Megaphone, UserPlus } from 'lucide-react';
import { isSunday, isSaturday, isAfter } from 'date-fns';
import { APPOINTMENT_TYPES } from '../../constants/appointmentTypes';
import { APPOINTMENT_SOURCES } from '../../constants/appointmentSources';

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmé':
      return 'bg-green-100 text-green-800';
    case 'en-attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'annulé':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getSourceIcon = (sourceId: string) => {
  const source = Object.values(APPOINTMENT_SOURCES).find(s => s.id === sourceId);
  if (!source) return <User className="h-4 w-4" />;

  switch (source.icon) {
    case 'Phone':
      return <Phone className="h-4 w-4" />;
    case 'Globe':
      return <Globe className="h-4 w-4" />;
    case 'Mail':
      return <Mail className="h-4 w-4" />;
    case 'Share2':
      return <Share2 className="h-4 w-4" />;
    case 'MessageSquare':
      return <MessageSquare className="h-4 w-4" />;
    case 'Users':
      return <Users className="h-4 w-4" />;
    case 'Megaphone':
      return <Megaphone className="h-4 w-4" />;
    case 'UserPlus':
      return <UserPlus className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

export const getAppointmentColor = (typeId: string, sourceId: string, date: Date) => {
  if (!typeId && !sourceId) return 'bg-gray-100 text-gray-800';

  const isPastDate = isAfter(new Date(), date);
  
  if (isPastDate) {
    const source = Object.values(APPOINTMENT_SOURCES).find(s => s.id === sourceId);
    return source?.color || 'bg-gray-100 text-gray-800';
  } else {
    const type = Object.values(APPOINTMENT_TYPES).find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  }
};

export const isBreakSlot = (time: string, date: Date) => {
  const [hours, minutes] = time.split(':').map(Number);
  
  if ((hours === 14 && minutes === 0) || 
      (hours === 17 && minutes === 30) || 
      hours >= 18) {
    return true;
  }

  if (isSunday(date)) {
    return true;
  }

  if (isSaturday(date) && hours >= 13) {
    return true;
  }

  return false;
};

export const isClickableBreakSlot = (time: string, date: Date) => {
  return !isBreakSlot(time, date);
};

export const getBreakTimeReason = (time: string, date: Date) => {
  if (time === '14:00') return 'Pause déjeuner';
  if (time === '17:30' || time >= '18:00') return 'Fin des consultations';
  if (isSunday(date)) return 'Dimanche';
  if (isSaturday(date) && time >= '13:00') return 'Samedi après-midi';
  return '';
};