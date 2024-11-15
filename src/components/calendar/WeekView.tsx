import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Video, MapPin } from 'lucide-react';
import { getSourceIcon, getAppointmentColor, isBreakSlot, isClickableBreakSlot } from './utils';
import { Appointment } from './types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface WeekViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function WeekView({ 
  selectedDate, 
  appointments, 
  onTimeSlotClick, 
  onAppointmentClick 
}: WeekViewProps) {
  const { 
    draggedAppointment,
    handleDragStart,
    handleDragEnd,
    handleDrop
  } = useDragAndDrop();

  const weekStart = startOfWeek(selectedDate, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  return (
    <div className="grid grid-cols-8 gap-1">
      <div className="col-start-2 col-span-7 grid grid-cols-7">
        {weekDays.map((day) => {
          const dayAppointments = appointments.filter(apt => 
            isSameDay(new Date(apt.time), day)
          );

          return (
            <div key={day.toString()} className="text-center p-2">
              <div className="font-medium mb-1">
                {format(day, 'EEE d', { locale: fr })}
              </div>
              <div className="text-xs text-gray-500">
                {dayAppointments.length > 0 && `${dayAppointments.length} RDV`}
              </div>
            </div>
          );
        })}
      </div>

      {timeSlots.map((time) => (
        <React.Fragment key={time}>
          <div className="text-right pr-4 text-gray-500 text-sm">
            {time}
          </div>
          {weekDays.map((day) => {
            const isBreak = isBreakSlot(time, day);
            const isClickable = isClickableBreakSlot(time, day);
            const dayAppointments = appointments.filter(
              (apt) => apt.time.includes(time) && isSameDay(new Date(apt.time), day)
            );
            const isSlotOccupied = dayAppointments.length > 0;

            return (
              <div
                key={day.toString()}
                className={`border border-gray-100 p-1 min-h-[60px] relative ${
                  isBreak ? 'bg-stripes-gray' : ''
                } ${draggedAppointment ? 'hover:bg-indigo-50' : ''}`}
                onClick={() => !isBreak && isClickable && !isSlotOccupied && onTimeSlotClick(day, time)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isBreak && isClickable && !isSlotOccupied) {
                    e.currentTarget.classList.add('bg-indigo-50');
                  }
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-indigo-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-indigo-50');
                  if (!isBreak && isClickable && !isSlotOccupied) {
                    handleDrop(day, time);
                  }
                }}
              >
                {dayAppointments.map((apt, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(apt)}
                    onDragEnd={handleDragEnd}
                    className={`p-1 rounded ${getAppointmentColor(apt.type, apt.status)} 
                      cursor-move hover:shadow-md transition-shadow mb-1`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {getSourceIcon(apt.source)}
                        <span className="text-xs font-medium truncate">{apt.patient}</span>
                        {apt.videoLink && (
                          <Video className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      {apt.location && (
                        <MapPin className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
                {(isClickable || !isBreak) && !draggedAppointment && !isSlotOccupied && (
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-indigo-50 bg-opacity-50 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}