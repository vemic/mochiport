import { formatDate, isValidDate, parseDate } from '@mochiport/shared'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2023-12-25T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('2023-12-25')
    })

    it('should format date with custom format', () => {
      const date = new Date('2023-12-25T10:30:00Z')
      const result = formatDate(date, 'yyyy-MM-dd HH:mm')
      expect(result).toMatch(/2023-12-25 \d{2}:\d{2}/)
    })

    it('should handle string dates', () => {
      const result = formatDate('2023-12-25T10:30:00Z')
      expect(result).toBe('2023-12-25')
    })

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })

    it('should handle null and undefined', () => {
      expect(formatDate(null as any)).toBe('Invalid Date')
      expect(formatDate(undefined as any)).toBe('Invalid Date')
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid Date objects', () => {
      const date = new Date('2023-12-25')
      expect(isValidDate(date)).toBe(true)
    })

    it('should return true for valid date strings', () => {
      expect(isValidDate('2023-12-25')).toBe(true)
      expect(isValidDate('2023-12-25T10:30:00Z')).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate('')).toBe(false)
      expect(isValidDate(null as any)).toBe(false)
      expect(isValidDate(undefined as any)).toBe(false)
    })

    it('should return false for non-date values', () => {
      expect(isValidDate(123 as any)).toBe(false)
      expect(isValidDate({} as any)).toBe(false)
      expect(isValidDate([] as any)).toBe(false)
    })
  })

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const result = parseDate('2023-12-25')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(11) // December is month 11
      expect(result.getDate()).toBe(25)
    })

    it('should parse ISO date strings', () => {
      const result = parseDate('2023-12-25T10:30:00Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getUTCFullYear()).toBe(2023)
      expect(result.getUTCMonth()).toBe(11)
      expect(result.getUTCDate()).toBe(25)
      expect(result.getUTCHours()).toBe(10)
      expect(result.getUTCMinutes()).toBe(30)
    })

    it('should return existing Date objects', () => {
      const original = new Date('2023-12-25')
      const result = parseDate(original)
      expect(result).toBe(original)
    })

    it('should handle invalid date strings', () => {
      const result = parseDate('invalid-date')
      expect(result).toBeInstanceOf(Date)
      expect(isNaN(result.getTime())).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(() => parseDate(null as any)).toThrow()
      expect(() => parseDate(undefined as any)).toThrow()
    })
  })
})
