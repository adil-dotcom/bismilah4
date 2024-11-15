import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Filter } from 'lucide-react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import CustomRangeView from './CustomRangeView';
import { useAppointments } from '../../contexts/AppointmentContext';
import { useAppointmentColors } from '../../hooks/useAppointmentColors';
import { Appointment } from './types';

interface CalendarProps {
  view: 'day' | 'week' | 'month' | 'custom';
  onViewChange: (view: 'day' | 'week' | 'month' | 'custom') => void;
  onAppointmentAdd?: (appointment: { date: Date; time: string }) => void;
  onAppointmentUpdate?: (appointment: Appointment) => void;
  dateRange: { start: Date; end: Date } | null;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function Calendar({ 
  view, 
  onViewChange,
  onAppointmentAdd,
  onAppointmentUpdate,
  dateRange,
  selectedDate,
  onDateSelect,
  onDateRangeChange
}: CalendarProps) {
  const { appointments } = useAppointments();
  const { typeColors } = useAppointmentColors();

  // Force refresh when appointments change
  useEffect(() => {}, [appointments]);

  const handleTimeSlotClick = (date: Date, time: string) => {
    if (onAppointmentAdd) {
      onAppointmentAdd({ date, time });
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentUpdate) {
      onAppointmentUpdate(appointment);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {dateRange && `${format(dateRange.start, 'd MMMM', { locale: fr })} - ${format(dateRange.end, 'd MMMM yyyy', { locale: fr })}`}
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onViewChange('day')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'day'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Jour
                </button>
                <button
                  onClick={() => onViewChange('week')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'week'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => onViewChange('month')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'month'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Mois
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Période :</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange?.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const startDate = e.target.value;
                const endDate = dateRange?.end ? format(dateRange.end, 'yyyy-MM-dd') : startDate;
                onDateRangeChange(startDate, endDate);
              }}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
            />
            <span className="text-sm text-gray-500">à</span>
            <input
              type="date"
              value={dateRange?.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const endDate = e.target.value;
                const startDate = dateRange?.start ? format(dateRange.start, 'yyyy-MM-dd') : endDate;
                onDateRangeChange(startDate, endDate);
              }}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {view === 'day' && (
          <DayView
            selectedDate={selectedDate}
            appointments={appointments}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            appointments={appointments}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentDate={selectedDate}
            appointments={appointments}
            onDateClick={onDateSelect}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {view === 'custom' && dateRange && (
          <CustomRangeView
            selectionRange={dateRange}
            appointments={appointments}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>
    </div>
  );
}