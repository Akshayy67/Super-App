import { Question } from "../InterviewSubjects";

// Collection of Aptitude questions covering quantitative, logical reasoning, and verbal ability
export const aptitudeQuestions: Question[] = [
  // Quantitative Aptitude - Numbers and Arithmetic
  {
    id: "apt-1",
    question: "If 20% of a number is 45, what is 60% of that number?",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Let the number be x. Given: 20% of x = 45, so 0.20x = 45, therefore x = 45/0.20 = 225. Now, 60% of 225 = 0.60 × 225 = 135.",
    tips: [
      "Set up the equation from the given information",
      "Solve for the unknown number first",
      "Then calculate the required percentage",
      "Double-check by verifying the original condition"
    ],
    tags: ["percentage", "arithmetic", "algebra"],
    estimatedTime: 2,
    industry: ["tech", "finance", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-2",
    question: "A train travels 60 km in 45 minutes. What is its speed in km/hr?",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Speed = Distance/Time. Distance = 60 km, Time = 45 minutes = 45/60 hours = 3/4 hours. Speed = 60 ÷ (3/4) = 60 × (4/3) = 80 km/hr.",
    tips: [
      "Convert time to hours for km/hr",
      "Use the formula: Speed = Distance/Time",
      "Be careful with unit conversions",
      "45 minutes = 0.75 hours"
    ],
    tags: ["speed", "time", "distance", "unit-conversion"],
    estimatedTime: 2,
    industry: ["tech", "logistics"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-3",
    question: "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Given ratio boys:girls = 3:2. If 3 parts represent boys and there are 15 boys, then each part = 15/3 = 5. Since girls represent 2 parts, number of girls = 2 × 5 = 10.",
    tips: [
      "Identify what each part of the ratio represents",
      "Calculate the value of one part",
      "Multiply by the number of parts for the answer",
      "Verify: 15:10 = 3:2 ✓"
    ],
    tags: ["ratio", "proportion", "arithmetic"],
    estimatedTime: 2,
    industry: ["tech", "education"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-4",
    question: "A shopkeeper sells an item for ₹480 and makes a 20% profit. What was the cost price?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Let cost price = x. Selling price = Cost price + 20% of cost price = x + 0.20x = 1.20x. Given: 1.20x = 480, so x = 480/1.20 = 400. The cost price was ₹400.",
    tips: [
      "Selling price = Cost price × (1 + profit%/100)",
      "Set up equation with cost price as unknown",
      "Profit percentage is calculated on cost price",
      "Verify: ₹400 + 20% of ₹400 = ₹400 + ₹80 = ₹480 ✓"
    ],
    tags: ["profit-loss", "percentage", "cost-price"],
    estimatedTime: 2,
    industry: ["tech", "finance", "retail"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-5",
    question: "Simple Interest: Principal = ₹5000, Rate = 8% per annum, Time = 3 years. Find the Simple Interest and Amount.",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Simple Interest formula: SI = (P × R × T)/100. SI = (5000 × 8 × 3)/100 = 120000/100 = ₹1200. Amount = Principal + Simple Interest = 5000 + 1200 = ₹6200.",
    tips: [
      "Remember the SI formula: PRT/100",
      "Amount = Principal + Interest",
      "Rate is per annum (per year)",
      "Be careful with percentage calculations"
    ],
    tags: ["simple-interest", "percentage", "finance"],
    estimatedTime: 2,
    industry: ["finance", "banking"],
    practiceCount: 0,
    successRate: 0,
  },

  // Quantitative Aptitude - Time and Work
  {
    id: "apt-6",
    question: "A can complete a work in 12 days, B can complete it in 18 days. How many days will they take working together?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "A's rate = 1/12 work per day, B's rate = 1/18 work per day. Combined rate = 1/12 + 1/18. To add fractions: LCM of 12 and 18 is 36. 1/12 = 3/36, 1/18 = 2/36. Combined rate = 3/36 + 2/36 = 5/36 work per day. Time = 1 ÷ (5/36) = 36/5 = 7.2 days.",
    tips: [
      "Work rate = 1/(time to complete)",
      "Add individual rates for combined rate",
      "Find common denominator for fraction addition",
      "Time together = 1/(combined rate)"
    ],
    tags: ["time-work", "rates", "fractions"],
    estimatedTime: 3,
    industry: ["tech", "operations"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-7",
    question: "A pipe can fill a tank in 6 hours, another pipe can empty it in 8 hours. If both pipes are open, how long to fill the tank?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Filling rate = 1/6 tank per hour, Emptying rate = 1/8 tank per hour. Net filling rate = 1/6 - 1/8. LCM of 6 and 8 is 24. 1/6 = 4/24, 1/8 = 3/24. Net rate = 4/24 - 3/24 = 1/24 tank per hour. Time to fill = 1 ÷ (1/24) = 24 hours.",
    tips: [
      "Filling rate is positive, emptying rate is negative",
      "Net rate = filling rate - emptying rate",
      "Find common denominator for subtraction",
      "Time = 1/(net rate)"
    ],
    tags: ["pipes-cisterns", "rates", "time"],
    estimatedTime: 3,
    industry: ["tech", "engineering"],
    practiceCount: 0,
    successRate: 0,
  },

  // Quantitative Aptitude - Averages and Mixtures
  {
    id: "apt-8",
    question: "The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What is the excluded number?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Sum of 5 numbers = 5 × 27 = 135. Sum of 4 numbers = 4 × 25 = 100. Excluded number = 135 - 100 = 35.",
    tips: [
      "Use: Sum = Average × Number of items",
      "Calculate total sum first",
      "Calculate sum after exclusion",
      "Difference gives the excluded number"
    ],
    tags: ["average", "arithmetic", "exclusion"],
    estimatedTime: 2,
    industry: ["tech", "statistics"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-9",
    question: "In what ratio must tea costing ₹60/kg be mixed with tea costing ₹90/kg to get a mixture worth ₹75/kg?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Use alligation method. Cheaper tea costs ₹60, dearer tea costs ₹90, mean price is ₹75. Difference of dearer from mean = 90 - 75 = 15. Difference of mean from cheaper = 75 - 60 = 15. Ratio = 15:15 = 1:1. So mix equal quantities of both teas.",
    tips: [
      "Use alligation method for mixture problems",
      "Calculate differences from mean price",
      "Ratio is inverse of the differences",
      "Verify: (60 + 90)/2 = 75 ✓"
    ],
    tags: ["mixture", "alligation", "ratio"],
    estimatedTime: 3,
    industry: ["tech", "manufacturing"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Number Series
  {
    id: "apt-10",
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Answer: 42. The pattern is n(n+1) where n starts from 2. 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42. Alternatively, differences: 6-2=4, 12-6=6, 20-12=8, 30-20=10. Differences increase by 2 each time, so next difference is 12, making next term 30+12=42.",
    tips: [
      "Look for patterns in differences between terms",
      "Try expressing terms as products: n(n+1)",
      "Check if differences form arithmetic progression",
      "Verify pattern with multiple terms"
    ],
    tags: ["number-series", "pattern", "arithmetic-progression"],
    estimatedTime: 3,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-11",
    question: "Complete the series: 1, 4, 9, 16, 25, ?",
    category: "logical-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Answer: 36. This is the series of perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36.",
    tips: [
      "Recognize perfect squares pattern",
      "Check if terms are squares of consecutive integers",
      "Next term would be (n+1)²",
      "Perfect squares are common in aptitude tests"
    ],
    tags: ["number-series", "perfect-squares", "pattern"],
    estimatedTime: 1,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-12",
    question: "Find the missing term: 3, 7, 15, 31, 63, ?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Answer: 127. The pattern is 2ⁿ - 1. 2¹-1=1 (but series starts at 3), 2²-1=3, 2³-1=7, 2⁴-1=15, 2⁵-1=31, 2⁶-1=63, 2⁷-1=127. Alternatively, each term is (previous term × 2) + 1.",
    tips: [
      "Look for exponential patterns",
      "Check if each term relates to powers of 2",
      "Try: next term = 2 × current term + 1",
      "Verify pattern holds for all given terms"
    ],
    tags: ["number-series", "exponential", "powers"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Coding-Decoding
  {
    id: "apt-13",
    question: "If COMPUTER is coded as RFUVQNPC, how is MEDICINE coded?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "The pattern is reverse alphabetical substitution: A↔Z, B↔Y, C↔X, etc. C(3rd)→X(24th), O(15th)→L(12th), M(13th)→N(14th), P(16th)→K(11th), U(21st)→F(6th), T(20th)→G(7th), E(5th)→V(22nd), R(18th)→I(9th). So COMPUTER → RFUVQNPC. For MEDICINE: M→N, E→V, D→W, I→R, C→X, I→R, N→M, E→V. Answer: NVWRXRMV.",
    tips: [
      "Look for alphabetical position patterns",
      "Check if it's simple substitution or positional",
      "A=1, B=2, ..., Z=26 for position reference",
      "Verify pattern with given example"
    ],
    tags: ["coding-decoding", "alphabet", "substitution"],
    estimatedTime: 4,
    industry: ["tech", "government"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-14",
    question: "If CAT is coded as 24120, how is DOG coded?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "The pattern appears to be alphabetical positions: C=3, A=1, T=20, giving 31220. But the code is 24120. Let me check: C=3→2, A=1→4, T=20→120. Pattern: each letter's position minus 1, then concatenated. C(3-1)=2, A(1-1)=0, but that gives 200, not 24120. Actually, it's: C=3→2, A=1→4, T=20→120, concatenated as 2-4-120. For DOG: D=4→3, O=15→14, G=7→6. Answer: 31406.",
    tips: [
      "Find the relationship between letters and numbers",
      "Check if it's position-based coding",
      "Look for arithmetic operations on positions",
      "Consider concatenation vs. addition"
    ],
    tags: ["coding-decoding", "numerical", "pattern"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Blood Relations
  {
    id: "apt-15",
    question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to E?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "A is B's sister, so A and B are siblings. C is B's mother, so C is also A's mother. D is C's father, so D is A's grandfather. E is D's mother, so E is A's great-grandmother. Therefore, A is E's great-granddaughter.",
    tips: [
      "Draw a family tree to visualize relationships",
      "Work step by step through each relationship",
      "Keep track of gender when relevant",
      "Great-grandmother is two generations above grandmother"
    ],
    tags: ["blood-relations", "family-tree", "generations"],
    estimatedTime: 3,
    industry: ["tech", "government"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-16",
    question: "Pointing to a man, a woman says 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "The woman says 'His mother is the only daughter of my mother.' The only daughter of the woman's mother is the woman herself. So the man's mother is the woman herself. Therefore, the woman is the man's mother.",
    tips: [
      "Break down 'only daughter of my mother'",
      "This refers to the speaker herself",
      "If his mother is the speaker, then speaker is his mother",
      "Be careful with possessive pronouns"
    ],
    tags: ["blood-relations", "logical-deduction", "pronouns"],
    estimatedTime: 2,
    industry: ["tech", "government"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Direction Sense
  {
    id: "apt-17",
    question: "A man walks 3 km North, then 4 km East, then 3 km South. How far is he from his starting point?",
    category: "logical-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "After walking 3 km North and 3 km South, he's back to the same North-South position as the start. He's only moved 4 km East from his starting point. Therefore, he is 4 km away from his starting point.",
    tips: [
      "Visualize the path on a coordinate system",
      "North and South movements cancel out",
      "Only the East movement contributes to displacement",
      "Use Pythagorean theorem for diagonal distances"
    ],
    tags: ["direction", "distance", "coordinates"],
    estimatedTime: 2,
    industry: ["tech", "navigation"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-18",
    question: "A person starts from point A, walks 10m South, then 10m East, then 10m North, then 10m West. Where is he now?",
    category: "logical-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "The person walks in a square path: 10m South, 10m East, 10m North, 10m West. This brings him back to the starting point A. The displacement is zero.",
    tips: [
      "Trace the complete path",
      "South and North movements cancel (10m each)",
      "East and West movements cancel (10m each)",
      "Square path returns to origin"
    ],
    tags: ["direction", "displacement", "path"],
    estimatedTime: 1,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Syllogism
  {
    id: "apt-19",
    question: "All cats are animals. Some animals are dogs. Conclusion: Some cats are dogs. Is this conclusion valid?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "No, the conclusion is invalid. From 'All cats are animals' and 'Some animals are dogs', we cannot conclude that 'Some cats are dogs.' The cats and dogs could be completely separate subsets of animals with no overlap. The statements don't provide any information about the relationship between cats and dogs specifically.",
    tips: [
      "Draw Venn diagrams to visualize relationships",
      "'All A are B' doesn't mean 'All B are A'",
      "Check if conclusion follows logically from premises",
      "Look for unstated assumptions"
    ],
    tags: ["syllogism", "logical-reasoning", "venn-diagrams"],
    estimatedTime: 3,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-20",
    question: "All roses are flowers. All flowers are plants. Conclusion: All roses are plants. Is this valid?",
    category: "logical-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Yes, this conclusion is valid. This is a valid syllogism using transitive property. If all roses are flowers, and all flowers are plants, then by transitivity, all roses are plants. This follows the logical form: All A are B, All B are C, therefore All A are C.",
    tips: [
      "Look for transitive relationships",
      "All A are B + All B are C = All A are C",
      "This is a valid logical form",
      "Chain of reasoning is sound"
    ],
    tags: ["syllogism", "transitivity", "logical-reasoning"],
    estimatedTime: 2,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },

  // Data Interpretation
  {
    id: "apt-21",
    question: "A bar chart shows sales: Jan(100), Feb(150), Mar(120), Apr(180), May(200). What's the average monthly sales and percentage increase from Jan to May?",
    category: "data-interpretation",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Average monthly sales = (100 + 150 + 120 + 180 + 200)/5 = 750/5 = 150 units. Percentage increase from Jan to May = ((200 - 100)/100) × 100% = (100/100) × 100% = 100%.",
    tips: [
      "Sum all values and divide by count for average",
      "Percentage change = ((New - Old)/Old) × 100%",
      "Be careful with the base value for percentage",
      "Check if the question asks for increase or total change"
    ],
    tags: ["data-interpretation", "average", "percentage-change"],
    estimatedTime: 2,
    industry: ["tech", "business", "analytics"],
    practiceCount: 0,
    successRate: 0,
  },

  // Verbal Reasoning - Analogies
  {
    id: "apt-22",
    question: "Book : Library :: Car : ?",
    category: "verbal-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Answer: Garage. The relationship is 'storage place for.' Books are stored in a library, cars are stored in a garage. Other possible answers could include parking lot or showroom, but garage is the most direct analogy.",
    tips: [
      "Identify the relationship between the first pair",
      "Apply the same relationship to find the answer",
      "Consider function, location, or category relationships",
      "Choose the most direct and common relationship"
    ],
    tags: ["analogies", "relationships", "verbal-reasoning"],
    estimatedTime: 1,
    industry: ["tech", "government"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-23",
    question: "Doctor : Hospital :: Teacher : ?",
    category: "verbal-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Answer: School. The relationship is 'workplace of.' A doctor works in a hospital, a teacher works in a school.",
    tips: [
      "Identify the professional and their workplace",
      "Look for the most common workplace association",
      "Consider primary vs. secondary workplaces",
      "Think about where the profession is primarily practiced"
    ],
    tags: ["analogies", "profession", "workplace"],
    estimatedTime: 1,
    industry: ["tech", "education"],
    practiceCount: 0,
    successRate: 0,
  },

  // Verbal Reasoning - Synonyms/Antonyms
  {
    id: "apt-24",
    question: "Choose the word most similar in meaning to 'METICULOUS': (A) Careless (B) Careful (C) Messy (D) Quick",
    category: "verbal-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Answer: (B) Careful. Meticulous means showing great attention to detail; very careful and precise. It's synonymous with careful, thorough, and precise.",
    tips: [
      "Meticulous = extremely careful and precise",
      "Look for words indicating attention to detail",
      "Eliminate obviously opposite words first",
      "Consider context where the word is commonly used"
    ],
    tags: ["synonyms", "vocabulary", "word-meaning"],
    estimatedTime: 1,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-25",
    question: "Choose the word most opposite in meaning to 'ABUNDANT': (A) Scarce (B) Plenty (C) Rich (D) Sufficient",
    category: "verbal-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Answer: (A) Scarce. Abundant means existing in large quantities; plentiful. Scarce means insufficient for the demand; in short supply. These are direct opposites.",
    tips: [
      "Abundant = plentiful, existing in large quantities",
      "Look for words indicating shortage or lack",
      "Scarce = rare, insufficient, in short supply",
      "Eliminate synonyms and neutral words"
    ],
    tags: ["antonyms", "vocabulary", "opposite-meaning"],
    estimatedTime: 1,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Statement and Assumption
  {
    id: "apt-26",
    question: "Statement: 'Use our soap for fair skin.' Assumption: People want fair skin. Is this assumption implicit?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Yes, the assumption is implicit. The advertisement assumes that people desire fair skin, otherwise advertising the soap for this purpose would be meaningless. The statement implies that fair skin is desirable and that people would want to use the soap to achieve it.",
    tips: [
      "An assumption is implicit if the statement depends on it",
      "Ask: 'Does the statement make sense without this assumption?'",
      "Implicit assumptions are unstated but necessary",
      "Consider the purpose and context of the statement"
    ],
    tags: ["assumption", "logical-reasoning", "implicit"],
    estimatedTime: 2,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },

  // More Quantitative Problems
  {
    id: "apt-27",
    question: "A rectangular field is 15m long and 10m wide. What is the cost of fencing it at ₹25 per meter?",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Perimeter of rectangle = 2(length + width) = 2(15 + 10) = 2 × 25 = 50 meters. Cost of fencing = 50 × 25 = ₹1250.",
    tips: [
      "Fencing requires calculating perimeter",
      "Perimeter of rectangle = 2(l + w)",
      "Multiply perimeter by cost per meter",
      "Don't confuse with area calculation"
    ],
    tags: ["geometry", "perimeter", "cost-calculation"],
    estimatedTime: 2,
    industry: ["tech", "construction"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-28",
    question: "If 15 men can build a wall in 20 days, how many days will 25 men take to build the same wall?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "This is inverse proportion. Total work = 15 men × 20 days = 300 man-days. If 25 men do the same work: Time = 300 man-days ÷ 25 men = 12 days.",
    tips: [
      "More men means less time (inverse proportion)",
      "Calculate total man-days first",
      "Use: Men₁ × Days₁ = Men₂ × Days₂",
      "Verify: 15 × 20 = 25 × 12 = 300 ✓"
    ],
    tags: ["time-work", "inverse-proportion", "man-days"],
    estimatedTime: 2,
    industry: ["tech", "construction"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-29",
    question: "A sum of money doubles itself in 8 years at simple interest. In how many years will it triple itself?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "If money doubles in 8 years, the simple interest earned equals the principal. SI = P, Time = 8 years. Using SI = PRT/100: P = (P × R × 8)/100, so R = 100/8 = 12.5% per annum. For money to triple, SI must equal 2P. Using 2P = (P × 12.5 × T)/100: 2 = 12.5T/100, so T = 200/12.5 = 16 years.",
    tips: [
      "Doubling means SI = Principal",
      "Tripling means SI = 2 × Principal",
      "Find the rate first from doubling condition",
      "Use the same rate for tripling calculation"
    ],
    tags: ["simple-interest", "doubling", "tripling"],
    estimatedTime: 3,
    industry: ["finance", "banking"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-30",
    question: "In a class of 40 students, 24 play cricket, 20 play football, and 6 play both games. How many students play neither game?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Using the inclusion-exclusion principle: Students playing at least one game = Cricket + Football - Both = 24 + 20 - 6 = 38. Students playing neither game = Total students - Students playing at least one game = 40 - 38 = 2.",
    tips: [
      "Use Venn diagram to visualize",
      "Apply inclusion-exclusion principle",
      "Students playing both are counted in both individual counts",
      "Neither = Total - (At least one game)"
    ],
    tags: ["sets", "venn-diagram", "inclusion-exclusion"],
    estimatedTime: 2,
    industry: ["tech", "statistics"],
    practiceCount: 0,
    successRate: 0,
  },

  // More Logical Reasoning
  {
    id: "apt-31",
    question: "If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely Lazzles. True or False?",
    category: "logical-reasoning",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "True. This is a valid application of transitivity in logic. If all A are B, and all B are C, then all A are C. Since all Bloops are Razzles, and all Razzles are Lazzles, it logically follows that all Bloops are Lazzles.",
    tips: [
      "This follows the transitive property",
      "All A → B, All B → C, therefore All A → C",
      "Draw circles to represent sets if helpful",
      "This is a fundamental logical principle"
    ],
    tags: ["logical-reasoning", "transitivity", "syllogism"],
    estimatedTime: 1,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-32",
    question: "In a certain code, RAIN is written as 8794 and VINE is written as 5694. How is NEAR written?",
    category: "logical-reasoning",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Compare the letters and codes: R=8, A=7, I=9, N=4 (from RAIN). V=5, I=9, N=4, E=6 (from VINE). We can see I=9, N=4 in both. So the code is: N=4, E=6, A=7, R=8. Therefore, NEAR = 4678.",
    tips: [
      "Match common letters between words",
      "Build a letter-to-number mapping",
      "Verify the mapping with both given examples",
      "Apply the mapping to find the answer"
    ],
    tags: ["coding-decoding", "pattern-matching", "substitution"],
    estimatedTime: 3,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },

  // Probability and Statistics
  {
    id: "apt-33",
    question: "A bag contains 5 red balls and 3 blue balls. What's the probability of drawing 2 red balls without replacement?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Probability of first red ball = 5/8. After drawing one red ball, there are 4 red balls left out of 7 total balls. Probability of second red ball = 4/7. Probability of both red = (5/8) × (4/7) = 20/56 = 5/14.",
    tips: [
      "Without replacement means total decreases",
      "Calculate conditional probability for second draw",
      "Multiply probabilities for 'and' events",
      "Simplify the final fraction"
    ],
    tags: ["probability", "conditional", "without-replacement"],
    estimatedTime: 2,
    industry: ["tech", "statistics"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-34",
    question: "A die is thrown twice. What's the probability that the sum is 7?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Favorable outcomes for sum = 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). That's 6 favorable outcomes. Total possible outcomes = 6 × 6 = 36. Probability = 6/36 = 1/6.",
    tips: [
      "List all ways to get the desired sum",
      "Order matters: (1,6) is different from (6,1)",
      "Total outcomes = 6² for two dice",
      "Count systematically to avoid missing cases"
    ],
    tags: ["probability", "dice", "combinations"],
    estimatedTime: 2,
    industry: ["tech", "gaming"],
    practiceCount: 0,
    successRate: 0,
  },

  // Geometry
  {
    id: "apt-35",
    question: "A circle has radius 7 cm. What is its area and circumference? (Use π = 22/7)",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Area of circle = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm². Circumference = 2πr = 2 × (22/7) × 7 = 2 × 22 = 44 cm.",
    tips: [
      "Area formula: πr²",
      "Circumference formula: 2πr",
      "When π = 22/7 and r = 7, calculations simplify",
      "Remember to include units in the answer"
    ],
    tags: ["geometry", "circle", "area", "circumference"],
    estimatedTime: 2,
    industry: ["tech", "engineering"],
    practiceCount: 0,
    successRate: 0,
  },

  // More Complex Problems
  {
    id: "apt-36",
    question: "A train 150m long crosses a platform 250m long in 20 seconds. What is the speed of the train?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Total distance covered = Length of train + Length of platform = 150 + 250 = 400m. Time taken = 20 seconds. Speed = Distance/Time = 400m/20s = 20 m/s. To convert to km/hr: 20 × (3600/1000) = 20 × 3.6 = 72 km/hr.",
    tips: [
      "Train must travel its own length plus platform length",
      "Speed = Total distance / Time",
      "Convert m/s to km/hr by multiplying by 3.6",
      "Visualize the train completely crossing the platform"
    ],
    tags: ["speed", "trains", "relative-motion"],
    estimatedTime: 3,
    industry: ["tech", "transportation"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-37",
    question: "A shopkeeper marks an item 40% above cost price and gives 10% discount. What is his profit percentage?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Let cost price = 100. Marked price = 100 + 40% of 100 = 140. Selling price after 10% discount = 140 - 10% of 140 = 140 - 14 = 126. Profit = 126 - 100 = 26. Profit percentage = (26/100) × 100% = 26%.",
    tips: [
      "Assume cost price = 100 for easy calculation",
      "Marked price = Cost price + markup",
      "Selling price = Marked price - discount",
      "Profit% = (Profit/Cost price) × 100%"
    ],
    tags: ["profit-loss", "discount", "markup"],
    estimatedTime: 3,
    industry: ["tech", "retail", "finance"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-38",
    question: "Two pipes can fill a tank in 6 and 8 hours respectively. A third pipe can empty the tank in 12 hours. If all three pipes are opened together, how long will it take to fill the tank?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Pipe 1 rate = 1/6 tank per hour. Pipe 2 rate = 1/8 tank per hour. Pipe 3 rate = -1/12 tank per hour (negative because it empties). Combined rate = 1/6 + 1/8 - 1/12. LCM of 6, 8, 12 is 24. 1/6 = 4/24, 1/8 = 3/24, 1/12 = 2/24. Combined rate = 4/24 + 3/24 - 2/24 = 5/24 tank per hour. Time = 1 ÷ (5/24) = 24/5 = 4.8 hours.",
    tips: [
      "Filling rates are positive, emptying rates are negative",
      "Find common denominator for rate addition",
      "Net rate = sum of all individual rates",
      "Time = 1/(net rate)"
    ],
    tags: ["pipes-cisterns", "rates", "time"],
    estimatedTime: 4,
    industry: ["tech", "engineering"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-39",
    question: "A man's age is 3 times his son's age. 15 years ago, the man was 9 times as old as his son. Find their present ages.",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Let son's present age = x, man's present age = 3x. 15 years ago: son's age = x-15, man's age = 3x-15. Given: 3x-15 = 9(x-15). Solving: 3x-15 = 9x-135, so 6x = 120, therefore x = 20. Present ages: Son = 20 years, Man = 60 years. Verification: 60 = 3×20 ✓. 15 years ago: Son was 5, Man was 45, and 45 = 9×5 ✓.",
    tips: [
      "Set up variables for present ages",
      "Express past ages in terms of present ages",
      "Set up equation from the given condition",
      "Always verify your answer"
    ],
    tags: ["age-problems", "algebra", "linear-equations"],
    estimatedTime: 3,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "apt-40",
    question: "A sum of ₹1200 is divided among A, B, and C in the ratio 2:3:7. How much does each person get?",
    category: "quantitative",
    difficulty: "easy",
    type: "technical",
    sampleAnswer: "Total ratio parts = 2 + 3 + 7 = 12. Value of each part = 1200/12 = 100. A gets 2 parts = 2 × 100 = ₹200. B gets 3 parts = 3 × 100 = ₹300. C gets 7 parts = 7 × 100 = ₹700. Verification: 200 + 300 + 700 = 1200 ✓.",
    tips: [
      "Add all parts of the ratio",
      "Divide total amount by total parts",
      "Multiply each person's parts by value per part",
      "Verify that individual amounts sum to total"
    ],
    tags: ["ratio", "proportion", "division"],
    estimatedTime: 2,
    industry: ["tech", "finance"],
    practiceCount: 0,
    successRate: 0,
  },

  // Logical Reasoning - Seating Arrangement
  {
    id: "apt-41",
    question: "5 people A, B, C, D, E sit in a row. A and B must sit together. C cannot sit at either end. How many arrangements are possible?",
    category: "logical-reasoning",
    difficulty: "hard",
    type: "technical",
    sampleAnswer: "Treat A and B as a single unit (AB). We now have 4 units to arrange: (AB), C, D, E. Since C cannot sit at ends, C must be in one of the 2 middle positions. Case 1: C in position 2: _ C _ _. The unit (AB) and individuals D, E can be arranged in the remaining 3 positions in 3! = 6 ways. Within (AB), A and B can be arranged in 2! = 2 ways. Total for case 1: 6 × 2 = 12. Case 2: C in position 3: _ _ C _. Similarly, 12 arrangements. Total = 12 + 12 = 24 arrangements.",
    tips: [
      "Treat connected people as a single unit",
      "Handle restrictions by considering cases",
      "Don't forget internal arrangements within units",
      "Verify by considering all constraints"
    ],
    tags: ["permutation", "arrangement", "constraints"],
    estimatedTime: 5,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },

  // Data Sufficiency
  {
    id: "apt-42",
    question: "What is the area of a rectangle? Statement 1: The perimeter is 20 cm. Statement 2: The length is twice the width.",
    category: "data-sufficiency",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Statement 1 alone: Perimeter = 20 cm means 2(l+w) = 20, so l+w = 10. This gives multiple possible rectangles, so insufficient. Statement 2 alone: l = 2w. Without knowing actual dimensions, insufficient. Both statements together: l+w = 10 and l = 2w. Substituting: 2w+w = 10, so 3w = 10, w = 10/3 cm, l = 20/3 cm. Area = l×w = (20/3) × (10/3) = 200/9 cm². Both statements together are sufficient.",
    tips: [
      "Check each statement individually first",
      "Then check if both together provide enough information",
      "Set up equations from the given information",
      "Solve the system of equations if possible"
    ],
    tags: ["data-sufficiency", "geometry", "system-equations"],
    estimatedTime: 4,
    industry: ["tech", "consulting"],
    practiceCount: 0,
    successRate: 0,
  },

  // Calendar Problems
  {
    id: "apt-43",
    question: "If January 1st, 2023 was a Sunday, what day of the week was March 15th, 2023?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "From January 1 to March 15: January has 31 days, so January 31 is 30 days after January 1. February 2023 has 28 days (not a leap year). March 15 is 14 days into March. Total days from January 1 = 30 + 28 + 14 = 72 days. 72 ÷ 7 = 10 remainder 2. So March 15 is 2 days after Sunday, which is Tuesday.",
    tips: [
      "Count total days from the reference date",
      "Remember February has 28 days in non-leap years",
      "Divide by 7 and use remainder",
      "Add remainder to the reference day"
    ],
    tags: ["calendar", "days", "modular-arithmetic"],
    estimatedTime: 3,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },

  // Clocks
  {
    id: "apt-44",
    question: "At what time between 2 and 3 o'clock are the hands of a clock together?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "At 2:00, hour hand is at 60° (2×30°), minute hand is at 0°. Hour hand moves 0.5° per minute, minute hand moves 6° per minute. Let them meet after t minutes past 2:00. Hour hand position = 60 + 0.5t, Minute hand position = 6t. For hands to meet: 60 + 0.5t = 6t, so 60 = 5.5t, therefore t = 60/5.5 = 120/11 ≈ 10.91 minutes. Time = 2:10:55 approximately (10 minutes 55 seconds past 2).",
    tips: [
      "Hour hand moves 0.5° per minute",
      "Minute hand moves 6° per minute",
      "Set up equation for when positions are equal",
      "Convert decimal minutes to minutes and seconds"
    ],
    tags: ["clocks", "angles", "relative-motion"],
    estimatedTime: 4,
    industry: ["tech", "general"],
    practiceCount: 0,
    successRate: 0,
  },

  // Compound Interest
  {
    id: "apt-45",
    question: "What will ₹5000 amount to in 2 years at 10% compound interest per annum?",
    category: "quantitative",
    difficulty: "medium",
    type: "technical",
    sampleAnswer: "Compound Interest formula: A = P(1 + R/100)ᵗ. A = 5000(1 + 10/100)² = 5000(1.1)² = 5000 × 1.21 = ₹6050. Compound Interest = Amount - Principal = 6050 - 5000 = ₹1050.",
    tips: [
      "Use A = P(1 + R/100)ᵗ for compound interest",
      "Calculate (1 + R/100) first",
      "Raise to the power of time period",
      "CI = Amount - Principal"
    ],
    tags: ["compound-interest", "exponential-growth", "finance"],
    estimatedTime: 2,
    industry: ["finance", "banking"],
    practiceCount: 0,
    successRate: 0,
  }
];