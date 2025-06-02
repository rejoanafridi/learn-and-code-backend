export function toPascalCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()) // Handle separators like _ or -
    .replace(/^[a-z]/, (chr) => chr.toUpperCase()); // Capitalize the first letter
}

export function toCamelCase(str: string): string {
  if (!str) return '';
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toPluralLowercase(str: string): string {
  if (!str) return '';
  const lowerStr = str.toLowerCase();

  // Very simple pluralization rules:
  // If ends with 'y' preceded by a consonant, change 'y' to 'ies' (e.g., category -> categories)
  if (lowerStr.endsWith('y') && lowerStr.length > 1 && !['a', 'e', 'i', 'o', 'u'].includes(lowerStr.charAt(lowerStr.length - 2))) {
    return lowerStr.slice(0, -1) + 'ies';
  }
  // If ends with 's', 'x', 'z', 'ch', 'sh', add 'es' (e.g., address -> addresses)
  if (lowerStr.endsWith('s') || lowerStr.endsWith('x') || lowerStr.endsWith('z') || lowerStr.endsWith('ch') || lowerStr.endsWith('sh')) {
    return lowerStr + 'es';
  }
  // Default: add 's'
  return lowerStr + 's';
}
