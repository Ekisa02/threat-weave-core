export type Event = {
  id: string;
  source: string;
  timestamp: string; // ISO
  message: string;
  meta?: Record<string, any>;
};

export type Alert = {
  id: string;
  eventId?: string;
  source: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  timestamp: string; // ISO
  data?: Record<string, any>;
};

export type Rule = {
  id: string;
  name: string;
  description?: string;
  severity: Alert['severity'];
  pattern: string; // simple regex string matched against event.message
};
