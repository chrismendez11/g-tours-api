import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function createKeywordWithDate(
  name: string,
  date: Date | string,
): string {
  const namePart = name
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
    .split(' ')
    .join('_');

  const dateObj = dayjs.utc(date);

  const monthName = dateObj.format('MMMM').toUpperCase();
  const day = dateObj.format('D');
  const year = dateObj.format('YYYY');

  const keyword = `${namePart}_${monthName}_${day}_${year}`;

  return keyword;
}
