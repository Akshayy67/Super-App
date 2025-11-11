# Streak Only Increases on Correct Answers - Fix

## Issue
The daily question streak was increasing even when users gave wrong answers. The streak should only increase when the answer is **correct**.

## Root Cause
In `dailyQuestionService.ts`, the `getUserStats()` function was checking `attempt.attempted` instead of `attempt.correct` when calculating streaks:

```typescript
// WRONG - counted all attempts
if (attempt && attempt.attempted) {
  tempStreak++;
  // ...
}
```

This meant any attempt (correct or incorrect) would continue the streak.

## Solution
Changed the streak calculation to only count correct answers:

```typescript
// CORRECT - only counts correct answers
if (attempt && attempt.correct) {
  tempStreak++;
  // ...
}
```

## File Modified
**`src/services/dailyQuestionService.ts`**

### Changes in `getUserStats()` function:

**Before:**
```typescript
// Calculate current streak
for (let i = 0; i < 365; i++) {
  const checkDate = new Date(todayDate);
  checkDate.setDate(checkDate.getDate() - i);
  const checkDateStr = checkDate.toISOString().split('T')[0];
  
  const attempt = attempts.find(a => a.date === checkDateStr);
  
  if (attempt && attempt.attempted) {  // ❌ Wrong - counts any attempt
    tempStreak++;
    if (i < 30) {
      currentStreak = tempStreak;
    }
  } else {
    // Break streak logic...
  }
}
```

**After:**
```typescript
// Calculate current streak (only count correct answers)
for (let i = 0; i < 365; i++) {
  const checkDate = new Date(todayDate);
  checkDate.setDate(checkDate.getDate() - i);
  const checkDateStr = checkDate.toISOString().split('T')[0];
  
  const attempt = attempts.find(a => a.date === checkDateStr);
  
  // Only count correct answers for streak
  if (attempt && attempt.correct) {  // ✅ Correct - only counts correct answers
    tempStreak++;
    if (i < 30) {
      currentStreak = tempStreak;
    }
  } else {
    // Break streak logic...
  }
}
```

## Behavior Now

### ✅ Streak Increases When:
- User answers the daily question **correctly**
- User maintains consecutive days of **correct** answers

### ❌ Streak Resets When:
- User gives an **incorrect** answer
- User misses a day (doesn't attempt at all)

### Example Scenarios:

**Scenario 1: Correct Answers**
- Day 1: Correct ✅ → Streak = 1 🔥
- Day 2: Correct ✅ → Streak = 2 🔥
- Day 3: Correct ✅ → Streak = 3 🔥

**Scenario 2: Wrong Answer Breaks Streak**
- Day 1: Correct ✅ → Streak = 1 🔥
- Day 2: Correct ✅ → Streak = 2 🔥
- Day 3: Wrong ❌ → Streak = 0 (reset)
- Day 4: Correct ✅ → Streak = 1 🔥 (starts over)

**Scenario 3: Missing Day Breaks Streak**
- Day 1: Correct ✅ → Streak = 1 🔥
- Day 2: Correct ✅ → Streak = 2 🔥
- Day 3: (no attempt) → Streak = 0 (reset)
- Day 4: Correct ✅ → Streak = 1 🔥 (starts over)

## Impact

### What This Fixes:
✅ Streak only increases with correct answers (as intended)
✅ Wrong answers break the streak (proper challenge)
✅ Motivates users to think carefully before answering
✅ Rewards consistency AND correctness

### What Stays the Same:
- XP is still only awarded for correct answers (+20 XP)
- Stats tracking (total attempted, total correct) unchanged
- Longest streak tracking still works correctly
- Sidebar streak display (🔥 icon) shows correct value

## Related Stats Affected

The `getUserStats()` function returns:
```typescript
{
  totalAttempted: number;    // All attempts (correct or wrong)
  totalCorrect: number;      // Only correct answers
  currentStreak: number;     // ✅ NOW: Only consecutive correct answers
  longestStreak: number;     // ✅ NOW: Longest run of consecutive correct answers
  totalXPEarned: number;     // Total XP from correct answers
}
```

## Testing Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Answer today's question correctly → Verify streak increases
- [ ] Tomorrow, answer incorrectly → Verify streak resets to 0
- [ ] Day after, answer correctly → Verify streak starts at 1 again
- [ ] Check sidebar shows correct streak count (🔥 number)
- [ ] Verify longest streak tracks correctly

## Build Status
✅ **Build Successful** - All TypeScript compiled without errors

## Deployment
1. Build completed successfully ✅
2. **Next step**: Hard refresh browser (Ctrl+Shift+R)
3. Test streak behavior with correct and incorrect answers
4. Verify sidebar streak display updates correctly

---

**Status**: ✅ Fixed and Built Successfully  
**Fix Date**: 2025-11-11  
**Behavior**: Streak now only increases on correct answers, as intended
