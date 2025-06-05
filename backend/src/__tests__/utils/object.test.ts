import { merge, pick, omit, isObjectEmpty, isPlainObject } from '@ai-chat/shared'

describe('Object Utils', () => {
  describe('merge', () => {
    it('should merge two simple objects', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { c: 3, d: 4 }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 })
    })

    it('should override properties in target object', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should merge nested objects', () => {
      const obj1 = { a: 1, nested: { x: 1, y: 2 } }
      const obj2 = { b: 2, nested: { y: 3, z: 4 } }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ 
        a: 1, 
        b: 2, 
        nested: { x: 1, y: 3, z: 4 } 
      })
    })

    it('should handle arrays by replacement', () => {
      const obj1 = { arr: [1, 2, 3] }
      const obj2 = { arr: [4, 5] }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ arr: [4, 5] })
    })

    it('should handle null and undefined values', () => {
      const obj1 = { a: 1, b: null }
      const obj2 = { b: 2, c: undefined }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 2, c: undefined })
    })

    it('should not mutate original objects', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { c: 3, d: 4 }
      const original1 = { ...obj1 }
      const original2 = { ...obj2 }
      
      merge(obj1, obj2)
      
      expect(obj1).toEqual(original1)
      expect(obj2).toEqual(original2)
    })
  })

  describe('pick', () => {
    it('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      const result = pick(obj, ['a', 'c'])
      expect(result).toEqual({ a: 1, c: 3 })
    })

    it('should handle non-existent properties', () => {
      const obj = { a: 1, b: 2 }
      const result = pick(obj, ['a', 'nonExistent'] as any)
      expect(result).toEqual({ a: 1 })
    })

    it('should handle empty key array', () => {
      const obj = { a: 1, b: 2 }
      const result = pick(obj, [])
      expect(result).toEqual({})
    })

    it('should handle empty object', () => {
      const obj = {}
      const result = pick(obj, ['a', 'b'])
      expect(result).toEqual({})
    })

    it('should preserve property values including falsy ones', () => {
      const obj = { a: 0, b: '', c: false, d: null, e: undefined }
      const result = pick(obj, ['a', 'b', 'c', 'd', 'e'])
      expect(result).toEqual({ a: 0, b: '', c: false, d: null, e: undefined })
    })
  })

  describe('omit', () => {
    it('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      const result = omit(obj, ['b', 'd'])
      expect(result).toEqual({ a: 1, c: 3 })
    })

    it('should handle non-existent properties', () => {
      const obj = { a: 1, b: 2 }
      const result = omit(obj, ['b', 'nonExistent'] as any)
      expect(result).toEqual({ a: 1 })
    })

    it('should handle empty key array', () => {
      const obj = { a: 1, b: 2 }
      const result = omit(obj, [])
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should handle empty object', () => {
      const obj = {}
      const result = omit(obj, ['a', 'b'])
      expect(result).toEqual({})
    })

    it('should preserve property values including falsy ones', () => {
      const obj = { a: 0, b: '', c: false, d: null, e: undefined, f: 1 }
      const result = omit(obj, ['f'])
      expect(result).toEqual({ a: 0, b: '', c: false, d: null, e: undefined })
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty objects', () => {
      expect(isObjectEmpty({})).toBe(true)
      expect(isObjectEmpty([])).toBe(true)
      expect(isObjectEmpty('')).toBe(true)
      expect(isObjectEmpty(null)).toBe(true)
      expect(isObjectEmpty(undefined)).toBe(true)
    })

    it('should return false for non-empty objects', () => {
      expect(isObjectEmpty({ a: 1 })).toBe(false)
      expect(isObjectEmpty([1, 2, 3])).toBe(false)
      expect(isObjectEmpty('hello')).toBe(false)
      expect(isObjectEmpty(0)).toBe(false)
      expect(isObjectEmpty(false)).toBe(false)
    })

    it('should handle objects with only undefined values', () => {
      expect(isObjectEmpty({ a: undefined })).toBe(false) // Object has properties, even if undefined
    })
  })

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ a: 1 })).toBe(true)
      expect(isPlainObject(Object.create(null))).toBe(true)
    })

    it('should return false for non-plain objects', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(new RegExp(''))).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(123)).toBe(false)
      expect(isPlainObject(true)).toBe(false)
    })

    it('should return false for class instances', () => {
      class TestClass {}
      const instance = new TestClass()
      expect(isPlainObject(instance)).toBe(false)
    })

    it('should return false for functions', () => {
      function testFunction() {}
      const arrowFunction = () => {}
      expect(isPlainObject(testFunction)).toBe(false)
      expect(isPlainObject(arrowFunction)).toBe(false)
    })
  })
})
