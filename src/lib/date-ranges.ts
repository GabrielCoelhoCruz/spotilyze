export const formatDateKey = (date: Date): string => {
  return date.toISOString().slice(0, 10)
}

export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export const eachDay = (start: Date, end: Date): Date[] => {
  const days: Date[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
