import { capitalize, truncate, slugify, isEmpty, isEmail } from '@ai-chat/shared'

describe('String Utils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('world')).toBe('World')
    })

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A')
      expect(capitalize('Z')).toBe('Z')
    })

    it('should only capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world')
      expect(capitalize('HELLO WORLD')).toBe('HELLO WORLD')
    })

    it('should handle strings starting with numbers or symbols', () => {
      expect(capitalize('123test')).toBe('123test')
      expect(capitalize('!hello')).toBe('!hello')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that should be truncated'
      expect(truncate(longString, 10)).toBe('This is a ...')
      expect(truncate(longString, 20)).toBe('This is a very long ...')
    })

    it('should not truncate short strings', () => {
      const shortString = 'Short'
      expect(truncate(shortString, 10)).toBe('Short')
      expect(truncate(shortString, 5)).toBe('Short')
    })

    it('should handle exact length strings', () => {
      const exactString = 'Exactly'
      expect(truncate(exactString, 7)).toBe('Exactly')
    })

    it('should handle custom suffix', () => {
      const longString = 'This is a very long string'
      expect(truncate(longString, 10, '...')).toBe('This is a ...')
      expect(truncate(longString, 10, ' [more]')).toBe('This is a  [more]')
    })

    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('')
    })
  })

  describe('slugify', () => {
    it('should convert strings to URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('The Quick Brown Fox')).toBe('the-quick-brown-fox')
    })

    it('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
      expect(slugify('Test@Example.com')).toBe('testexamplecom')
    })

    it('should handle multiple spaces and dashes', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
      expect(slugify('Hello---World')).toBe('hello-world')
    })

    it('should handle unicode characters', () => {
      expect(slugify('Café & Restaurant')).toBe('cafe-restaurant')
      expect(slugify('Naïve résumé')).toBe('naive-resume')
    })

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('')
    })

    it('should handle strings with only special characters', () => {
      expect(slugify('!@#$%^&*()')).toBe('')
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty('\\t\\n')).toBe(true)
    })

    it('should return false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(' hello ')).toBe(false)
      expect(isEmpty('0')).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(isEmpty(null as any)).toBe(true)
      expect(isEmpty(undefined as any)).toBe(true)
    })
  })

  describe('isEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('user.name@domain.co.uk')).toBe(true)
      expect(isEmail('firstname+lastname@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isEmail('invalid-email')).toBe(false)
      expect(isEmail('user@')).toBe(false)
      expect(isEmail('@domain.com')).toBe(false)
      expect(isEmail('user..name@domain.com')).toBe(false)
    })

    it('should handle empty strings', () => {
      expect(isEmail('')).toBe(false)
      expect(isEmail('   ')).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(isEmail(null as any)).toBe(false)
      expect(isEmail(undefined as any)).toBe(false)
    })
  })
})
