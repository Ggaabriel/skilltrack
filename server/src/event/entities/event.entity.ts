import { TEventColor } from '../types/event-color.type';

export class Event {
  'id': number;
  'title': string;
  'description': string | null;
  'startDate': Date;
  'endDate': Date;
  'color': TEventColor;
  'userId': number;
}
