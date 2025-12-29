import { describe, it, expect } from 'vitest'
import { getLoyaltyTier, getNextLoyaltyTier, calculateLoyaltyDiscountAmount, LOYALTY_TIERS } from './loyalty'

describe('Loyalty System', () => {
  describe('getLoyaltyTier', () => {
    it('should return "Kezdő" for 0 spending', () => {
      const tier = getLoyaltyTier(0)
      expect(tier.name).toBe('Kezdő')
      expect(tier.discount).toBe(0)
    })

    it('should return "Bronz" for 50,000 spending', () => {
      const tier = getLoyaltyTier(50000)
      expect(tier.name).toBe('Bronz')
      expect(tier.discount).toBe(0.02)
    })

    it('should return "Bronz" for 199,999 spending', () => {
      const tier = getLoyaltyTier(199999)
      expect(tier.name).toBe('Bronz')
    })

    it('should return "Ezüst" for 200,000 spending', () => {
      const tier = getLoyaltyTier(200000)
      expect(tier.name).toBe('Ezüst')
      expect(tier.discount).toBe(0.04)
    })

    it('should return "Gyémánt" for 1,000,000+ spending', () => {
      const tier = getLoyaltyTier(1500000)
      expect(tier.name).toBe('Gyémánt')
      expect(tier.discount).toBe(0.10)
    })
  })

  describe('getNextLoyaltyTier', () => {
    it('should return "Bronz" for "Kezdő" user', () => {
      const nextTier = getNextLoyaltyTier(0)
      expect(nextTier?.name).toBe('Bronz')
    })

    it('should return "Ezüst" for "Bronz" user', () => {
      const nextTier = getNextLoyaltyTier(50000)
      expect(nextTier?.name).toBe('Ezüst')
    })

    it('should return null for "Gyémánt" user', () => {
      const nextTier = getNextLoyaltyTier(1000000)
      expect(nextTier).toBeNull()
    })
  })

  describe('calculateLoyaltyDiscountAmount', () => {
    it('should calculate 0 discount for Kezdő', () => {
      const discount = calculateLoyaltyDiscountAmount(10000, 0)
      expect(discount).toBe(0)
    })

    it('should calculate 2% discount for Bronz', () => {
      // 10,000 * 0.02 = 200
      const discount = calculateLoyaltyDiscountAmount(10000, 50000)
      expect(discount).toBe(200)
    })

    it('should round the discount correctly', () => {
      // 1234 * 0.02 = 24.68 -> 25
      const discount = calculateLoyaltyDiscountAmount(1234, 50000)
      expect(discount).toBe(25)
    })
  })
})
