import React from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Video, MapPin } from 'lucide-react';
import { getSourceIcon, getAppointmentColor, isBreakSlot, isClickableBreakSlot } from './utils';
import { Appointment } from './types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function DayView({ 
  selectedDate, 
  appointments, 
  onTimeSlotClick, 
  onAppointmentClick 
}: DayViewProps) {
  const { 
    draggedAppointment,
    handleDragStart,
    handleDragEnd,
    handleDrop
  } = useDragAndDrop();

  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  return (
    <div className="flex flex-col space-y-1">
      {timeSlots.map((time) => {
        const isBreak = isBreakSlot(time, selectedDate);
        const isClickable = isClickableBreakSlot(time, selectedDate);
        const slotAppointments = appointments.filter(
          (apt) => apt.time.includes(time) && isSameDay(new Date(apt.time), selectedDate)
        );
        const isSlotOccupied = slotAppointments.length > 0;

        return (
          <div
            key={time}
            className={`flex border-b border-gray-100 min-h-[60px] ${
              isBreak ? 'bg-stripes-gray' : ''
            } ${draggedAppointment ? 'hover:bg-indigo-50' : ''}`}
            onClick={() => !isBreak && isClickable && !isSlotOccupied && onTimeSlotClick(selectedDate, time)}
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
                handleDrop(selectedDate, time);
              }
            }}
          >
            <div className="w-20 text-right pr-4 text-gray-500 text-sm py-2">
              {time}
            </div>
            <div className="flex-1 relative p-1">
              {slotAppointments.map((apt, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(apt)}
                  onDragEnd={handleDragEnd}
                  className={`mb-1 p-2 rounded ${getAppointmentColor(apt.type, apt.source, new Date(apt.time))} 
                    cursor-move hover:shadow-md transition-shadow`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(apt);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(apt.source)}
                      <span className="font-medium text-sm">{apt.patient}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {apt.location && <MapPin className="h-3 w-3" />}
                      {apt.videoLink && <Video className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                </div>
              ))}
              {(isClickable || !isBreak) && !draggedAppointment && !isSlotOccupied && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-indigo-50 bg-opacity-50 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-indigo-600" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}