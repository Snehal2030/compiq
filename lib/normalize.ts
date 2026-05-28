export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '')
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatLPA(amount: number): string {
  const lpa = amount / 100000
  return `₹${lpa.toFixed(1)} LPA`
}

export function calcTotalComp(base: number, bonus: number, stock: number): number {
  return base + (bonus || 0) + (stock || 0)
}
