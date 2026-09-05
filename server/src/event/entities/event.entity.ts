import { TEventColor } from '../types/event-color.type';

export class Event {
  'id': number;
  'title': string;
  'description': string | null;
  'startDate': string;
  'endDate': string;
  'color': TEventColor;
  'userId': number;
  'notificationSentAt': string | null;
}
