export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export function formatRateCents(cents: number): string {
  return `$${(cents / 100).toFixed(4)}`
}
