// Centralized pricing utility functions for the new feedback system

import { FeedbackMode, FEEDBACK_MODES } from '@/lib/types/roast-request';

export interface PricingCalculation {
  basePrice: number;
  questionCount: number;
  freeQuestions: number;
  billableQuestions: number;
  questionPrice: number;
  questionsCost: number;
  urgencyCost: number;
  totalPerRoaster: number;
  totalPrice: number;
  mode: FeedbackMode;
  isUrgent: boolean;
}

/**
 * Calculate pricing for a roast request based on the new feedback mode system
 */
export function calculateRoastPricing(
  mode: FeedbackMode,
  questionCount: number,
  roasterCount: number,
  isUrgent: boolean = false
): PricingCalculation {
  const config = FEEDBACK_MODES[mode];
  
  // For FREE mode, no questions are allowed
  const actualQuestionCount = mode === 'FREE' ? 0 : questionCount;
  
  // Calculate billable questions (questions beyond the free limit)
  const billableQuestions = Math.max(0, actualQuestionCount - config.freeQuestions);
  
  // Calculate costs
  const questionsCost = billableQuestions * config.questionPrice;
  const urgencyCost = isUrgent ? 0.50 : 0; // 0.50€ per roaster for urgency
  const totalPerRoaster = config.basePrice + questionsCost + urgencyCost;
  const totalPrice = totalPerRoaster * roasterCount;

  return {
    basePrice: config.basePrice,
    questionCount: actualQuestionCount,
    freeQuestions: config.freeQuestions,
    billableQuestions,
    questionPrice: config.questionPrice,
    questionsCost,
    urgencyCost,
    totalPerRoaster,
    totalPrice,
    mode,
    isUrgent
  };
}

/**
 * Validate question count limits for a feedback mode
 */
export function validateQuestionCount(mode: FeedbackMode, questionCount: number): {
  isValid: boolean;
  error?: string;
  maxQuestions?: number;
} {
  // Define reasonable limits per mode
  const limits = {
    FREE: 0,
    TARGETED: 20,
    STRUCTURED: 15
  };

  const maxQuestions = limits[mode];

  if (mode === 'FREE' && questionCount > 0) {
    return {
      isValid: false,
      error: 'Le mode "Impression générale" ne permet pas d\'ajouter des questions',
      maxQuestions
    };
  }

  if (questionCount > maxQuestions) {
    return {
      isValid: false,
      error: `Maximum ${maxQuestions} questions autorisées pour le mode ${FEEDBACK_MODES[mode].label}`,
      maxQuestions
    };
  }

  if (questionCount < 0) {
    return {
      isValid: false,
      error: 'Le nombre de questions ne peut pas être négatif',
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
  const { basePrice, billableQuestions, questionPrice, questionsCost, urgencyCost, totalPerRoaster, totalPrice, isUrgent } = calculation;

  return {
    baseLabel: `Base : ${basePrice.toFixed(2)}€`,
    questionsLabel: billableQuestions > 0 
      ? `Questions : ${billableQuestions} × ${questionPrice.toFixed(2)}€ = ${questionsCost.toFixed(2)}€`
      : 'Questions : incluses',
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
export function getMaxQuestionsForBudget(
  mode: FeedbackMode,
  maxBudgetPerRoaster: number
): number {
  const config = FEEDBACK_MODES[mode];
  
  if (mode === 'FREE') return 0;
  
  if (maxBudgetPerRoaster < config.basePrice) return 0;
  
  const availableForQuestions = maxBudgetPerRoaster - config.basePrice;
  const additionalQuestions = Math.floor(availableForQuestions / config.questionPrice);
  
  return config.freeQuestions + additionalQuestions;
}

/**
 * Compare pricing between different modes for the same question count
 */
export function compareModesPricing(questionCount: number, roasterCount: number): {
  mode: FeedbackMode;
  calculation: PricingCalculation;
  isRecommended: boolean;
}[] {
  const results = [];
  
  for (const mode of Object.keys(FEEDBACK_MODES) as FeedbackMode[]) {
    const validation = validateQuestionCount(mode, questionCount);
    
    if (validation.isValid) {
      const calculation = calculateRoastPricing(mode, questionCount, roasterCount, false);
      results.push({
        mode,
        calculation,
        isRecommended: mode === 'STRUCTURED' // Default recommendation
      });
    }
  }
  
  // Sort by total price
  return results.sort((a, b) => a.calculation.totalPrice - b.calculation.totalPrice);
}

/**
 * Suggest the best mode for a given scenario
 */
export function suggestBestMode(
  questionCount: number,
  hasDomains: boolean = false
): {
  suggestedMode: FeedbackMode;
  reason: string;
  alternatives: FeedbackMode[];
} {
  if (questionCount === 0) {
    return {
      suggestedMode: 'FREE',
      reason: 'Parfait pour un feedback général sans questions spécifiques',
      alternatives: ['TARGETED', 'STRUCTURED']
    };
  }
  
  if (questionCount <= 3 && !hasDomains) {
    return {
      suggestedMode: 'TARGETED',
      reason: 'Idéal pour quelques questions spécifiques',
      alternatives: ['STRUCTURED']
    };
  }
  
  return {
    suggestedMode: 'STRUCTURED',
    reason: 'Recommandé pour organiser vos questions par domaines d\'expertise',
    alternatives: ['TARGETED']
  };
}