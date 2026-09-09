// Utilidades para el RUT chileno (sin dependencias externas).

// Quita puntos, guiones y espacios de un RUT y lo devuelve en mayúsculas.
export function cleanRut(rut: string): string {
  return rut.replace(/[.\s-]/g, '').toUpperCase();
}

// Valida el dígito verificador de un RUT con el algoritmo módulo 11 chileno.
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return checkDigit === expected;
}

// Formatea un RUT limpio con puntos y guión para mostrarlo (ej. "123456789" -> "12.345.678-9").
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${checkDigit}`;
}

// Compara dos RUTs normalizando el formato de ambos antes de comparar.
export function rutsAreEqual(rutA: string, rutB: string): boolean {
  return cleanRut(rutA) === cleanRut(rutB);
}
