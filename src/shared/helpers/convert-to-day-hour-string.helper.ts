import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import es from 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.locale(es);
export function convertToDateHourString(date: Dayjs | Date): string {
  return dayjs.utc(date).format('DD-MM-YYYY, HH:mm');
}
