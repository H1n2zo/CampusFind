export const CATEGORIES = [
  'Electronics', 'Clothing', 'Accessories', 'Documents',
  'Bags', 'Keys', 'Books', 'Other'
] as const

export type Category = typeof CATEGORIES[number]

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })
}
