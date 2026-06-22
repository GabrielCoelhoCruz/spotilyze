import { describe, expect, it, beforeEach, vi } from 'vitest'

import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('allows requests within limit', () => {
    const key = `test-${Date.now()}-${Math.random()}`
    const first = checkRateLimit(key, 3, 60_000)
    const second = checkRateLimit(key, 3, 60_000)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(second.remaining).toBe(1)
  })

  it('blocks requests over limit', () => {
    const key = `block-${Date.now()}-${Math.random()}`
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    const third = checkRateLimit(key, 2, 60_000)

    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })
})
