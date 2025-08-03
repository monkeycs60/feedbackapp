// Centralized pricing utility functions - Unified system without modes

import { PRICING } from '@/lib/types/roast-request';

export interface PricingCalculation {
  basePrice: number;
  questionCount: number;
  questionPrice: number;
  questionsCost: number;
  urgencyCost: number;
  totalPerRoaster: number;
  totalPrice: number;
  isUrgent: boolean;
}

/**
 * Calculate pricing for a roast request with unified pricing
 */
export function calculateRoastPricing(
  questionCount: number,
  roasterCount: number,
  isUrgent: boolean = false
): PricingCalculation {
  // Calculate costs
  const questionsCost = questionCount * PRICING.QUESTION_PRICE;
  const urgencyCost = isUrgent ? PRICING.URGENCY_PRICE : 0;
  const totalPerRoaster = PRICING.BASE_PRICE + questionsCost + urgencyCost;
  const totalPrice = totalPerRoaster * roasterCount;

  return {
    basePrice: PRICING.BASE_PRICE,
    questionCount,
    questionPrice: PRICING.QUESTION_PRICE,
    questionsCost,
    urgencyCost,
    totalPerRoaster,
    totalPrice,
    isUrgent
  };
}

/**
 * Validate question count limits
 */
export function validateQuestionCount(questionCount: number): {
  isValid: boolean;
  error?: string;
  maxQuestions?: number;
} {
  const maxQuestions = 20; // Reasonable global limit

  if (questionCount < 0) {
    return {
      isValid: false,
      error: 'Le nombre de questions ne peut pas être négatif',
      maxQuestions
    };
  }

  if (questionCount > maxQuestions) {
    return {
      isValid: false,
      error: `Maximum ${maxQuestions} questions autorisées`,
      maxQuestions
    };
  }

  return { isValid: true, maxQuestions };
}

/**
 * Get pricing breakdown as formatted strings
 */
export function formatPricingBreakdown(calculation: PricingCalculation): {
  baseLabel: string;
  questionsLabel: string;
  urgencyLabel: string;
  totalLabel: string;
  perRoasterLabel: string;
} {
  const { basePrice, questionCount, questionPrice, questionsCost, urgencyCost, totalPerRoaster, totalPrice, isUrgent } = calculation;

  return {
    baseLabel: `Base : ${basePrice.toFixed(2)}€`,
    questionsLabel: questionCount > 0 
      ? `Questions : ${questionCount} × ${questionPrice.toFixed(2)}€ = ${questionsCost.toFixed(2)}€`
      : 'Questions : aucune',
    urgencyLabel: isUrgent ? `Urgence : +${urgencyCost.toFixed(2)}€` : '',
    perRoasterLabel: `Par roaster : ${totalPerRoaster.toFixed(2)}€`,
    totalLabel: `Total : ${totalPrice.toFixed(2)}€`
  };
}

/**
 * Legacy pricing calculation for backward compatibility
 */
export function calculateLegacyPricing(
  domainCount: number,
  additionalQuestions: number,
  roasterCount: number
): number {
  const DOMAIN_PRICE = 2;
  const ADDITIONAL_QUESTION_PRICE = 1;
  
  const totalPerRoaster = (domainCount * DOMAIN_PRICE) + (additionalQuestions * ADDITIONAL_QUESTION_PRICE);
  return totalPerRoaster * roasterCount;
}

/**
 * Get the maximum affordable question count for a given budget
 */
export function getMaxQuestionsForBudget(maxBudgetPerRoaster: number): number {
  if (maxBudgetPerRoaster < PRICING.BASE_PRICE) return 0;
  
  const availableForQuestions = maxBudgetPerRoaster - PRICING.BASE_PRICE;
  return Math.floor(availableForQuestions / PRICING.QUESTION_PRICE);
}

/**
 * Suggest pricing strategy based on question count
 */
export function suggestPricingStrategy(questionCount: number): {
  suggestedPricePerRoaster: number;
  reason: string;
  isEconomical: boolean;
} {
  const calculation = calculateRoastPricing(questionCount, 1, false);
  
  if (questionCount === 0) {
    return {
      suggestedPricePerRoaster: calculation.totalPerRoaster,
      reason: 'Prix de base pour feedback général',
      isEconomical: true
    };
  }
  
  if (questionCount <= 2) {
    return {
      suggestedPricePerRoaster: calculation.totalPerRoaster,
      reason: 'Idéal pour quelques questions ciblées',
      isEconomical: true
    };
  }
  
  return {
    suggestedPricePerRoaster: calculation.totalPerRoaster,
    reason: `${questionCount} questions personnalisées`,
    isEconomical: questionCount <= 6
  };
}