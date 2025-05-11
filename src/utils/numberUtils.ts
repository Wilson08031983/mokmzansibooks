/**
 * Parses a string representing a number with either dot or comma as decimal separator
 * @param value String value to parse
 * @returns Parsed number value or NaN if invalid
 */
export function parseNumberWithComma(value: string | number): number {
  if (typeof value === 'number') return value;
  
  // Handle empty or undefined values
  if (!value) return 0;
  
  // Replace comma with dot for decimal
  const normalizedValue = value.toString().replace(',', '.');
  
  // Parse the normalized value
  return parseFloat(normalizedValue);
}

/**
 * Parses an integer from a string
 * @param value String value to parse
 * @returns Parsed integer value or NaN if invalid
 */
export function parseIntSafe(value: string | number): number {
  if (typeof value === 'number') return Math.floor(value);
  
  // Handle empty or undefined values
  if (!value) return 0;
  
  // Parse the integer value
  return parseInt(value, 10);
}
