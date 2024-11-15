export interface DateRange {
  start: Date;
  end: Date;
}

export interface Appointment {
  id: string;
  patient: string;
  contact?: string;
  time: string;
  duration: string;
  type: string;
  source: string;
  status: 'confirmé' | 'en-attente' | 'annulé';
  location?: string;
  description?: string;
  participants?: string[];
  notifications?: { type: string; time: number }[];
  videoLink?: string;
}