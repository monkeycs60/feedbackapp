# Product Requirements Document: Feedback & Pricing Simplification Strategy

**Date:** 2025-01-26  
**Author:** Claude  
**Status:** Proposal

## Executive Summary

After analyzing the current implementation, I recommend simplifying the feedback system by **merging the best of both modes** into a single, flexible feedback type and implementing a **free market pricing model** with a price floor. This will reduce complexity while maintaining flexibility for creators and providing fair compensation for roasters.

## Current State Analysis

### Problems Identified

1. **Mode Confusion**: Two separate feedback modes (FREE and STRUCTURED) create decision paralysis for creators
2. **Pricing Complexity**: Different pricing structures between modes confuse both creators and roasters
3. **Artificial Limitations**: FREE mode doesn't allow questions despite having a sophisticated feedback form
4. **Maintenance Overhead**: Supporting multiple modes increases code complexity and bug surface area

### What Works Well

- The structured feedback form in FREE mode provides excellent baseline insights
- The question customization in STRUCTURED mode allows specific inquiry
- Domain organization helps creators focus their feedback requests
- Drag-and-drop question ordering improves UX

## Recommended Solution: Unified Feedback System

### 1. Single Feedback Type: "CUSTOM"

Merge the best features of both modes into one flexible system:

```
CUSTOM Mode Features:
- Base structured feedback form (ratings, impressions, strengths/weaknesses)
- Optional custom questions (0 to unlimited)
- Questions organized by domains (keep existing structure)
- Creator can choose which domains to activate
- Default questions available but fully customizable
```

#### Benefits:
- Eliminates mode selection confusion
- Every feedback includes baseline quality metrics
- Flexibility for creators who want just general feedback OR specific questions
- Maintains backward compatibility (existing feedback data remains valid)

### 2. Free Market Pricing Model

Replace fixed pricing with creator-controlled pricing:

```
Pricing Structure:
- Creator sets price per roaster (minimum 3€ floor)
- Price applies to entire feedback (no per-question charges)
- Urgency option: +50% of base price (creator's choice)
- Platform fee: 20% of transaction
- Roaster receives: 80% of set price
```

#### Implementation Details:

**Price Setting UI:**
- Slider or input field (3€ - 50€ range)
- Market average indicator
- Suggested price based on:
  - Number of questions
  - Required expertise level
  - Estimated completion time
  - Historical data from similar roasts

**Marketplace Display:**
- Clear price per roaster
- Total potential earnings
- Price justification (if provided by creator)
- Filter/sort by price options

#### Benefits:
- Market self-regulates based on complexity and value
- Creators with budget constraints can still get feedback
- High-value projects can attract expert roasters with higher compensation
- Eliminates confusing per-question calculations

## Migration Strategy

### Phase 1: Backend Preparation (Week 1)
1. Update database schema:
   - Add `pricePerRoaster` field to RoastRequest
   - Create migration to convert existing pricing
   - Maintain backward compatibility flags

### Phase 2: UI Updates (Week 2)
1. Merge feedback creation flows
2. Implement new pricing UI
3. Update marketplace with new pricing display

### Phase 3: Data Migration (Week 3)
1. Convert existing roasts:
   - FREE mode → CUSTOM with 0 questions
   - STRUCTURED → CUSTOM with existing questions
   - Calculate equivalent `pricePerRoaster` from old pricing

### Phase 4: Cleanup (Week 4)
1. Remove old mode selection code
2. Deprecate legacy pricing calculations
3. Update documentation

## Technical Implementation

### Database Changes

```prisma
model RoastRequest {
  // Remove feedbackMode enum
  // Add new fields
  pricePerRoaster   Float    @default(3.0)
  includeBaseFeedback Boolean @default(true)
  
  // Keep existing
  questions         RoastQuestion[]
  focusAreas        String[]
}
```

### API Changes

```typescript
// Simplified pricing calculation
function calculateTotalPrice(roastRequest) {
  const basePrice = roastRequest.pricePerRoaster
  const urgencyMultiplier = roastRequest.isUrgent ? 1.5 : 1.0
  return basePrice * urgencyMultiplier * roastRequest.maxRoasters
}
```

### UI Flow

1. **Create Roast Wizard:**
   - Step 1: Basic info + audience
   - Step 2: Feedback customization (domains + questions)
   - Step 3: Pricing (set price with market guidance)
   - Step 4: Review & publish

2. **Marketplace:**
   - Show price prominently
   - Display question count as supplementary info
   - Allow filtering by price range

## Success Metrics

1. **Simplicity**: Reduce roast creation time by 40%
2. **Adoption**: Increase roast creation rate by 25%
3. **Satisfaction**: Improve creator NPS by 20 points
4. **Revenue**: Increase average transaction value by 15%

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Price race to bottom | Low | 3€ minimum floor + quality ratings |
| Creator confusion during transition | Medium | Clear migration guide + tooltips |
| Roaster earnings concern | Medium | Show historical average prices |
| Complex roasts underpriced | Low | Suggested pricing algorithm |

## Alternative Considered

**Alternative: Question-Pack Pricing**
- Pre-defined packages (Basic 3€, Standard 5€, Premium 10€)
- Rejected because it doesn't solve the core flexibility issue

## Conclusion

This unified approach simplifies the mental model for users while maintaining the flexibility that makes the platform valuable. The free market pricing empowers creators to value their own needs while ensuring fair compensation for roasters.

## Next Steps

1. Validate proposal with key stakeholders
2. Run pricing experiments with small user group
3. Create detailed technical specifications
4. Begin phased implementation

---

**Appendix: User Quotes Supporting This Direction**

*"I don't understand why I have to choose between getting general feedback or asking specific questions - I want both!"* - Creator feedback

*"The pricing is confusing - just let me set a fair price for the work involved"* - Creator feedback

*"I'd prefer to see the total price upfront rather than calculating questions"* - Roaster feedback