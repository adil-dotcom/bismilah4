import { format, isSunday, isSaturday } from 'date-fns';

export const useTimeSlots = () => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const isBreakTime = (time: string, date: Date) => {
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

  const getBreakTimeReason = (time: string, date: Date) => {
    if (time === '14:00') return 'Pause déjeuner';
    if (time === '17:30' || time >= '18:00') return 'Fin des consultations';
    if (isSunday(date)) return 'Dimanche';
    if (isSaturday(date) && time >= '13:00') return 'Samedi après-midi';
    return '';
  };

  const getTimeSlotLabel = (time: string, date: Date) => {
    const reason = getBreakTimeReason(time, date);
    return reason ? `${time} (${reason})` : time;
  };

  return {
    timeSlots,
    isBreakTime,
    getTimeSlotLabel,
    getBreakTimeReason
  };
};