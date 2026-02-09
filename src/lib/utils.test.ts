import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { cn } from './utils.ts'

describe('cn utility', () => {
  it('should handle single string', () => {
    strictEqual(cn('foo'), 'foo')
  })

  it('should handle multiple strings', () => {
    strictEqual(cn('foo', 'bar'), 'foo bar')
  })

  it('should handle objects with truthy values', () => {
    strictEqual(cn({ foo: true, bar: false }), 'foo')
  })

  it('should handle objects with falsy values', () => {
    strictEqual(cn({ foo: false, bar: false }), '')
  })

  it('should handle arrays', () => {
    strictEqual(cn(['foo', 'bar']), 'foo bar')
  })

  it('should handle nested arrays', () => {
    strictEqual(cn(['foo', ['bar', 'baz']]), 'foo bar baz')
  })

  it('should handle mixed inputs', () => {
    strictEqual(cn('foo', { bar: true, baz: false }, ['qux']), 'foo bar qux')
  })

  it('should handle falsy values (null, undefined, false, 0, empty string)', () => {
    strictEqual(cn(null, false, 'bar', undefined, 0, ''), 'bar')
  })
})
