import { describe, it, expect } from 'vitest'

// ── Phone formatter (copied from booking page) ──────────────────────────────
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 10)
  if (digits.length > 6) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return digits
}

// ── Tracking code pattern ────────────────────────────────────────────────────
function isValidTrackingCode(code: string): boolean {
  return /^BK-[A-Z0-9]{6}$/.test(code)
}

// ── Email validator ──────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── Rating validator ─────────────────────────────────────────────────────────
function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

// ── Average rating ───────────────────────────────────────────────────────────
function calcAvgRating(ratings: number[]): number {
  if (!ratings.length) return 0
  return parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
}

// ────────────────────────────────────────────────────────────────────────────
describe('Phone Number Formatter', () => {
  it('formats 10-digit number correctly', () => {
    expect(formatPhoneNumber('0812345678')).toBe('081-234-5678')
  })
  it('strips non-digit characters', () => {
    expect(formatPhoneNumber('081-234-5678')).toBe('081-234-5678')
  })
  it('handles partial input (3 digits)', () => {
    expect(formatPhoneNumber('081')).toBe('081')
  })
  it('handles partial input (6 digits)', () => {
    expect(formatPhoneNumber('081234')).toBe('081-234')
  })
  it('caps at 10 digits', () => {
    expect(formatPhoneNumber('08123456789999')).toBe('081-234-5678')
  })
  it('returns empty string for empty input', () => {
    expect(formatPhoneNumber('')).toBe('')
  })
})

describe('Tracking Code Validator', () => {
  it('accepts valid tracking code format', () => {
    expect(isValidTrackingCode('BK-ABC123')).toBe(true)
  })
  it('rejects lowercase letters', () => {
    expect(isValidTrackingCode('BK-abc123')).toBe(false)
  })
  it('rejects wrong prefix', () => {
    expect(isValidTrackingCode('TK-ABC123')).toBe(false)
  })
  it('rejects short code', () => {
    expect(isValidTrackingCode('BK-AB1')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidTrackingCode('')).toBe(false)
  })
})

describe('Email Validator', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })
  it('rejects missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })
  it('rejects missing domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

describe('Rating Validator', () => {
  it('accepts 1–5', () => {
    ;[1, 2, 3, 4, 5].forEach((r) => expect(isValidRating(r)).toBe(true))
  })
  it('rejects 0', () => {
    expect(isValidRating(0)).toBe(false)
  })
  it('rejects 6', () => {
    expect(isValidRating(6)).toBe(false)
  })
  it('rejects decimal', () => {
    expect(isValidRating(3.5)).toBe(false)
  })
})

describe('Average Rating Calculator', () => {
  it('calculates correct average', () => {
    expect(calcAvgRating([4, 5, 3])).toBe(4)
  })
  it('returns 0 for empty array', () => {
    expect(calcAvgRating([])).toBe(0)
  })
  it('rounds to 1 decimal place', () => {
    expect(calcAvgRating([4, 5])).toBe(4.5)
  })
  it('handles single rating', () => {
    expect(calcAvgRating([3])).toBe(3)
  })
})
