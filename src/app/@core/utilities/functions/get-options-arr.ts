export function getOptionsArray(
  lookUp: any[],
  value: string,
  label: string | string[],
  valueType?: string,
  native?: boolean
) {
  if (!lookUp || !lookUp.length) return [];

  return lookUp.map((item) => {
    const itemLabel =
      typeof label === 'string' ? item[label] : concatenateLabel(label, item);
    const itemValue =
      valueType === 'object' && !native
        ? { label: itemLabel, value: item[value] }
        : native
        ? item
        : item[value];
    return { label: itemLabel, value: itemValue };
  });
}

function concatenateLabel(label: string[], obj: any): string {
  return label.map((prop) => obj[prop]).join(' - ');
}
