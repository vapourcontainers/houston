export function getSize(size: number): { value: number, unit: string } {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unit = 0;
  while (size > 1024) {
    size /= 1024;
    unit++;
  }
  return { value: size, unit: units[unit] };
}
