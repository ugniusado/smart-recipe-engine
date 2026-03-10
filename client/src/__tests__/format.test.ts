import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPct,
  URGENCY_COLOR,
  URGENCY_LABEL,
} from '../utils/format'

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats a typical grocery price', () => {
    expect(formatCurrency(3.49)).toBe('$3.49')
  })

  it('formats a value with cents', () => {
    expect(formatCurrency(8.99)).toBe('$8.99')
  })

  it('formats a round dollar amount', () => {
    expect(formatCurrency(10)).toBe('$10.00')
  })
})

describe('formatCurrencyCompact', () => {
  it('returns $0.00 for NaN', () => {
    expect(formatCurrencyCompact(NaN)).toBe('$0.00')
  })

  it('returns $0.00 for Infinity', () => {
    expect(formatCurrencyCompact(Infinity)).toBe('$0.00')
  })

  it('formats values under $10k normally', () => {
    expect(formatCurrencyCompact(1234.56)).toBe('$1,234.56')
  })

  it('abbreviates values >= $10k as K', () => {
    expect(formatCurrencyCompact(12500)).toBe('$12.5K')
  })

  it('abbreviates values >= $1M as M', () => {
    expect(formatCurrencyCompact(2_500_000)).toBe('$2.5M')
  })

  it('abbreviates values >= $1B as B', () => {
    expect(formatCurrencyCompact(3_000_000_000)).toBe('$3.0B')
  })

  it('formats exactly $10k boundary as K', () => {
    expect(formatCurrencyCompact(10_000)).toBe('$10.0K')
  })
})

describe('formatPct', () => {
  it('formats 0 as 0%', () => {
    expect(formatPct(0)).toBe('0%')
  })

  it('formats 100 as 100%', () => {
    expect(formatPct(100)).toBe('100%')
  })

  it('rounds decimal percentages', () => {
    expect(formatPct(66.7)).toBe('67%')
  })
})

describe('URGENCY_COLOR', () => {
  it('maps all four urgency levels', () => {
    expect(URGENCY_COLOR['expired']).toBe('urg-expired')
    expect(URGENCY_COLOR['urgent']).toBe('urg-urgent')
    expect(URGENCY_COLOR['soon']).toBe('urg-soon')
    expect(URGENCY_COLOR['safe']).toBe('urg-safe')
  })
})

describe('URGENCY_LABEL', () => {
  it('maps all four urgency levels', () => {
    expect(URGENCY_LABEL['expired']).toBe('Expired')
    expect(URGENCY_LABEL['urgent']).toBe('0-2d')
    expect(URGENCY_LABEL['soon']).toBe('3-7d')
    expect(URGENCY_LABEL['safe']).toBe('8d+')
  })
})
