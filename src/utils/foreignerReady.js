export function getForeignerReadyStatus({ en, phone, card, flow }) {
  if (en && phone && flow && card !== false) return "ready";
  if (phone === false || flow === false) return "blocked";
  return "assisted";
}
