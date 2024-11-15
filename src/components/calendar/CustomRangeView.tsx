import React from 'react';
import { format, isSameDay, eachDayOfInterval, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Video, MapPin } from 'lucide-react';
import { getSourceIcon, getAppointmentColor, isBreakSlot, isClickableBreakSlot } from './utils';
import { Appointment, DateRange } from './types';

interface CustomRangeViewProps {
  selectionRange: DateRange;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function CustomRangeView({
  selectionRange,
  appointments,
  onTimeSlotClick,
  onAppointmentClick
}: CustomRangeViewProps) {
  const days = eachDayOfInterval(selectionRange);
  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const rangeDuration = differenceInDays(selectionRange.end, selectionRange.start) + 1;

  const renderDetailedAppointment = (apt: Appointment) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {getSourceIcon(apt.source)}
          <span className="font-medium text-sm">{apt.patient}</span>
        </div>
        <div className="flex items-center space-x-1">
          {apt.location && <MapPin className="h-3 w-3" />}
          {apt.videoLink && <Video className="h-3 w-3 text-blue-500" />}
        </div>
      </div>
      <div className="text-xs mt-1">{apt.type}</div>
    </>
  );

  const renderCompactAppointment = (apt: Appointment) => (
    <div className="flex items-center space-x-1 text-xs">
      {getSourceIcon(apt.source)}
      <span className="truncate">{apt.patient.split(' ')[0]}</span>
    </div>
  );

  const renderSummaryBars = (dayAppointments: Appointment[]) => {
    if (dayAppointments.length === 0) return null;

    const typeCount = dayAppointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(typeCount));

    return (
      <div className="flex flex-col space-y-1 p-1">
        {Object.entries(typeCount).map(([type, count], index) => (
          <div key={index} className="flex items-center space-x-1">
            <div
              className={`h-2 rounded-full ${getAppointmentColor(type, 'confirmé')}`}
              style={{ 
                width: `${(count / maxCount) * 100}%`,
                minWidth: '20%'
              }}
            />
            <span className="text-xs text-gray-500">{count}</span>
          </div>
        ))}
        <div className="text-xs text-center text-gray-600 font-medium mt-1">
          Total: {dayAppointments.length}
        </div>
      </div>
    );
  };

  const renderAppointments = (dayAppointments: Appointment[], isBreak: boolean) => {
    if (dayAppointments.length === 0) return null;

    if (rangeDuration <= 3) {
      return dayAppointments.map((apt, i) => (
        <div
          key={i}
          className={`p-2 rounded ${getAppointmentColor(apt.type, apt.status)} 
            cursor-pointer hover:shadow-md transition-shadow`}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick(apt);
          }}
        >
          {renderDetailedAppointment(apt)}
        </div>
      ));
    } else if (rangeDuration <= 7) {
      return dayAppointments.map((apt, i) => (
        <div
          key={i}
          className={`p-1 rounded ${getAppointmentColor(apt.type, apt.status)} 
            cursor-pointer hover:shadow-md transition-shadow mb-1`}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick(apt);
          }}
        >
          {renderCompactAppointment(apt)}
        </div>
      ));
    } else {
      return renderSummaryBars(dayAppointments);
    }
  };

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${days.length}, 1fr)` }}>
      <div className="col-start-2 col-span-full grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day) => (
          <div key={day.toString()} className="text-center p-2 font-medium">
            {format(day, 'EEE d', { locale: fr })}
          </div>
        ))}
      </div>
      
      {timeSlots.map((time) => (
        <React.Fragment key={time}>
          <div className="text-right pr-4 text-gray-500 text-sm">{time}</div>
          {days.map((day) => {
            const isBreak = isBreakSlot(time, day);
            const isClickable = isClickableBreakSlot(time, day);
            const dayAppointments = appointments.filter(
              (apt) => apt.time.includes(time) && isSameDay(new Date(apt.time), day)
            );

            return (
              <div
                key={day.toString()}
                className={`border border-gray-100 p-1 min-h-[60px] relative ${
                  isBreak ? 'bg-stripes-gray hover:bg-stripes-gray-light' : ''
                }`}
                onClick={() => (isClickable || !isBreak) && onTimeSlotClick(day, time)}
              >
                {renderAppointments(dayAppointments, isBreak)}
                {(isClickable || !isBreak) && dayAppointments.length === 0 && (
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