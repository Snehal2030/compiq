export function formatLPA(amount: number): string {
  const lpa = amount / 100000
  return `₹${lpa.toFixed(1)}L`
}

export function formatCrore(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('compiq_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
