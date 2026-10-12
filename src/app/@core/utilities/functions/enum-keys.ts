export function getEnumKeys(e: any): string[] {
  return Object.keys(e).filter(k => isNaN(Number(k)));
}