import { format, parse, differenceInYears, isSameDay, addDays } from 'date-fns'
import { Member } from './types'

export interface BirthdayMember {
  id: string
  full_name: string
  phone: string
  email: string | null
  date_of_birth: string
  age: number | null
  profile_picture_url: string | null
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  return differenceInYears(new Date(), dob)
}

/**
 * Check if a date matches today's month and day (ignoring year)
 */
export function isBirthdayToday(dateOfBirth: string | Date): boolean {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  const today = new Date()
  
  return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()
}

/**
 * Check if a birthday is within the next N days
 */
export function isBirthdayInNextDays(dateOfBirth: string | Date, days: number): boolean {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Create this year's birthday
  let birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate())
  
  // If birthday already passed this year, use next year's birthday
  if (birthdayThisYear < today) {
    birthdayThisYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate())
  }
  
  // Check if birthday is within the next N days
  const endDate = addDays(today, days)
  return birthdayThisYear >= today && birthdayThisYear <= endDate
}

/**
 * Get days until next birthday
 */
export function daysUntilBirthday(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  const today = new Date()
  const currentYear = today.getFullYear()
  
  let birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate())
  
  if (birthdayThisYear < today) {
    birthdayThisYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate())
  }
  
  const diff = birthdayThisYear.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Get members with birthdays today
 */
export function getTodaysBirthdays(members: Member[]): BirthdayMember[] {
  return members
    .filter(member => isBirthdayToday(member.date_of_birth))
    .map(member => ({
      id: member.id,
      full_name: member.full_name,
      phone: member.phone,
      email: member.email,
      date_of_birth: member.date_of_birth,
      age: calculateAge(member.date_of_birth),
      profile_picture_url: member.profile_picture_url,
    }))
}

/**
 * Get members with upcoming birthdays (within next N days, excluding today)
 */
export function getUpcomingBirthdays(members: Member[], days: number = 7): BirthdayMember[] {
  return members
    .filter(member => {
      const isToday = isBirthdayToday(member.date_of_birth)
      const isUpcoming = isBirthdayInNextDays(member.date_of_birth, days)
      return !isToday && isUpcoming
    })
    .map(member => ({
      id: member.id,
      full_name: member.full_name,
      phone: member.phone,
      email: member.email,
      date_of_birth: member.date_of_birth,
      age: calculateAge(member.date_of_birth),
      profile_picture_url: member.profile_picture_url,
    }))
    .sort((a, b) => {
      // Sort by days until birthday
      return daysUntilBirthday(a.date_of_birth) - daysUntilBirthday(b.date_of_birth)
    })
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatString: string = 'PPP'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatString)
}

/**
 * Format birthday display (without year)
 */
export function formatBirthday(dateOfBirth: string | Date): string {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  return format(dob, 'MMMM d')
}
