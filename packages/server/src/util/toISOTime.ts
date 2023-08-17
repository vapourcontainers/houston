import dayjs from 'dayjs';

export default function toISOTime(time: string | undefined): string | undefined {
  if (!time) return undefined;
  return dayjs(time).toISOString();
}
