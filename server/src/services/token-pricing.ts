import { TokenType } from '../../generated/prisma';

// Model pricing in cents per 1M tokens (matches OpenAI pricing as of Jan 2025)
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-3.5-turbo': { input: 50, output: 150 },    // $0.50/$1.50 per 1M tokens
  'gpt-4': { input: 3000, output: 6000 },         // $30/$60 per 1M tokens
  'gpt-4-turbo': { input: 1000, output: 3000 },   // $10/$30 per 1M tokens
  'gpt-4o': { input: 250, output: 1000 },         // $2.50/$10.00 per 1M tokens
  'gpt-4o-mini': { input: 40, output: 160 },      // $0.40/$1.60 per 1M tokens
  'gpt-4.1-mini': { input: 40, output: 160 },     // $0.40/$1.60 per 1M tokens
  'o1-preview': { input: 1500, output: 6000 },    // $15/$60 per 1M tokens
  'o1-mini': { input: 300, output: 1200 },        // $3/$12 per 1M tokens
};

/**
 * Calculate the cost in cents for a given number of tokens
 */
export function calculateTokenCost(
  modelUsed: string,
  tokensUsed: number,
  tokenType: TokenType
): number {
  const pricing = MODEL_PRICING[modelUsed] || MODEL_PRICING['gpt-4'];
  const pricePerMillion = tokenType === TokenType.input ? pricing.input : pricing.output;
  
  // Calculate cost in cents with decimal precision (don't round up)
  return (tokensUsed * pricePerMillion) / 1_000_000;
}

/**
 * Calculate the total cost for input and output tokens
 */
export function calculateTotalCost(
  modelUsed: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const inputCost = calculateTokenCost(modelUsed, inputTokens, TokenType.input);
  const outputCost = calculateTokenCost(modelUsed, outputTokens, TokenType.output);
  
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}