export function daysBetween(a: Date, b: Date) { return Math.ceil((b.getTime() - a.getTime()) / 86_400_000); }
