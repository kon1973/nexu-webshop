import { prisma } from '@/lib/prisma';

export const LOYALTY_TIERS = [
  { name: 'Kezdő', minSpent: 0, discount: 0, color: 'text-gray-500', description: 'Kezdő szint' },
  { name: 'Bronz', minSpent: 50000, discount: 0.02, color: 'text-orange-700', description: '2% kedvezmény minden vásárlásból' },
  { name: 'Ezüst', minSpent: 200000, discount: 0.04, color: 'text-gray-400', description: '4% kedvezmény minden vásárlásból' },
  { name: 'Arany', minSpent: 400000, discount: 0.06, color: 'text-yellow-500', description: '6% kedvezmény minden vásárlásból' },
  { name: 'Platina', minSpent: 800000, discount: 0.08, color: 'text-purple-600', description: '8% kedvezmény minden vásárlásból' },
  { name: 'Gyémánt', minSpent: 1000000, discount: 0.10, color: 'text-cyan-500', description: '10% kedvezmény minden vásárlásból' },
];

export function getLoyaltyTier(totalSpent: number) {
  // Find the highest tier where minSpent <= totalSpent
  // We copy the array and reverse it to find the highest matching tier first
  return [...LOYALTY_TIERS].reverse().find(tier => totalSpent >= tier.minSpent) || LOYALTY_TIERS[0];
}

export function getNextLoyaltyTier(totalSpent: number) {
  return LOYALTY_TIERS.find(tier => totalSpent < tier.minSpent) || null;
}

export function calculateLoyaltyDiscountAmount(subtotal: number, totalSpent: number) {
  const tier = getLoyaltyTier(totalSpent);
  if (tier.discount === 0) return 0;
  return Math.round(subtotal * tier.discount);
}

export async function updateUserSpending(userId: string) {
  try {
    // Calculate total spent from paid orders
    // We consider orders with status 'completed', 'shipped', 'delivered' as valid spending
    // You might want to include 'paid' if that's a status you use
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['completed', 'shipped', 'delivered', 'paid'] } 
      },
      select: { totalPrice: true }
    });

    const totalSpent = orders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0);

    await prisma.user.update({
      where: { id: userId },
      data: { totalSpent }
    });
    
    return totalSpent;
  } catch (error) {
    console.error('Error updating user spending:', error);
    return 0;
  }
}
