export function formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
        .replace('yyyy', String(year))
        .replace('MM', month)
        .replace('dd', day)
}

export function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay()
}

export function addMonths(date: Date, months: number): Date {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() + months)
    return newDate
}

export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
    const newDate = new Date(date)
    const day = newDate.getDay()
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
    newDate.setDate(newDate.getDate() - diff)
    newDate.setHours(0, 0, 0, 0)
    return newDate
}

export function endOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
    const newDate = startOfWeek(date, weekStartsOn)
    newDate.setDate(newDate.getDate() + 6)
    newDate.setHours(23, 59, 59, 999)
    return newDate
}
