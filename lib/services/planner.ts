export function splitWeeklyHours(hoursPerWeek: number) {
  const fullLengthHours = Math.round(hoursPerWeek * 0.2 * 10) / 10;
  const targetedHours = Math.max(0, hoursPerWeek - fullLengthHours);
  return { fullLengthHours, targetedHours };
}
