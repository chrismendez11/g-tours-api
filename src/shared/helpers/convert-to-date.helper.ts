import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function convertToDate(date: string): Date {
  return dayjs.utc(date).toDate();
}
