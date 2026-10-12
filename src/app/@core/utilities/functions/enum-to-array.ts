
export function enumToArray(enumObject: any) {
  return Object.keys(enumObject)
    .filter(key => isNaN(Number(enumObject[key])))
    .map(key => ({ value: enumObject[key], label: key }))
}

export function enumToArray2(enumObject: any): string[] {
  return Object.values(enumObject);
}
