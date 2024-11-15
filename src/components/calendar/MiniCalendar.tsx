import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from './types';
import { useSelectedDayAppointments } from '../../hooks/useSelectedDayAppointments';
import { useAppointmentColors } from '../../hooks/useAppointmentColors';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  selectionRange: DateRange | null;
  onDateSelect: (date: Date, isRangeSelection?: boolean) => void;
  onRangeSelect: (range: DateRange | null) => void;
  appointments: Array<{
    id: string;
    patient: string;
    type: string;
    source: string;
    time: string;
  }>;
}

export default function MiniCalendar({
  currentDate,
  selectedDate,
  selectionRange,
  onDateSelect,
  onRangeSelect,
  appointments = []
}: MiniCalendarProps) {
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const { typeColors, sourceColors } = useAppointmentColors();
  const { summary } = useSelectedDayAppointments(appointments, selectedDate);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: fr });
  const days = eachDayOfInterval({ start: startDate, end: monthEnd });

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handleMouseDown = (date: Date) => {
    setSelectionStart(date);
    setIsSelecting(true);
    onRangeSelect(null);
  };

  const handleMouseMove = (date: Date) => {
    if (isSelecting && selectionStart) {
      const start = selectionStart < date ? selectionStart : date;
      const end = selectionStart < date ? date : selectionStart;
      onRangeSelect({ start, end });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
    if (selectionRange) {
      if (isSameMonth(selectionRange.start, selectionRange.end) &&
          selectionRange.start.getTime() === startOfMonth(selectionRange.start).getTime() &&
          selectionRange.end.getTime() === endOfMonth(selectionRange.start).getTime()) {
        onDateSelect(selectionRange.start, true);
      } else {
        onRangeSelect(selectionRange);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!selectionRange) return false;
    return isWithinInterval(date, selectionRange);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onDateSelect(subMonths(currentDate, 1), false)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h3>
        <button
          onClick={() => onDateSelect(addMonths(currentDate, 1), false)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {weekDays.map((day, index) => (
          <div key={`header-${index}`} className="text-center font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        {days.map((day, dayIndex) => {
          const dayAppointments = appointments.filter(apt => 
            isSameDay(new Date(apt.time), day)
          );

          return (
            <button
              key={`day-${dayIndex}`}
              onMouseDown={() => handleMouseDown(day)}
              onMouseMove={() => handleMouseMove(day)}
              onMouseUp={handleMouseUp}
              onClick={() => !isSelecting && onDateSelect(day, false)}
              className={`
                aspect-square p-1 text-sm relative
                ${!isSameMonth(day, currentDate) ? 'text-gray-400' : 'text-gray-900'}
                ${isSameDay(day, selectedDate) ? 'bg-indigo-600 text-white font-semibold rounded-full' : ''}
                ${isDateInRange(day) ? 'bg-indigo-100' : ''}
                ${isDateInRange(day) && !isSameDay(day, selectedDate) ? 'hover:bg-indigo-200' : 'hover:bg-gray-100'}
                rounded-full
                transition-colors
              `}
            >
              <span>{format(day, 'd')}</span>
              {dayAppointments.length > 0 && !isSameDay(day, selectedDate) && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        <div className="text-xs text-gray-600">
          <p className="font-medium">{summary.text}</p>
          {summary.count && (
            <div className="mt-2">
              <p>{summary.count}</p>
              <p className="mt-1 text-xs text-gray-500 whitespace-pre-line line-clamp-2">
                {summary.appointments}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Type de consultation</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${color.split(' ')[0]} mr-2`}></span>
                <span className="text-xs text-gray-600">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Source du rendez-vous</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(sourceColors).map(([source, color]) => (
              <div key={source} className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${color.split(' ')[0]} mr-2`}></span>
                <span className="text-xs text-gray-600">{source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}