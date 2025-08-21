// 100 Most Asked JAM (Just A Minute) Topics for Interview Practice
export const jamTopics: string[] = [
  // Personal & Life Topics
  "My biggest achievement",
  "A person who inspires me",
  "My favorite childhood memory",
  "The best advice I ever received",
  "My dream vacation destination",
  "A skill I want to learn",
  "My role model and why",
  "The most important lesson life taught me",
  "My favorite hobby and why I love it",
  "A book that changed my perspective",
  
  // Professional & Career Topics
  "Why I chose my career path",
  "My ideal work environment",
  "The importance of teamwork",
  "Leadership qualities I admire",
  "My biggest professional challenge",
  "The role of innovation in business",
  "Work-life balance importance",
  "My five-year career plan",
  "The value of continuous learning",
  "Why communication skills matter",
  
  // Technology & Innovation
  "The impact of social media on society",
  "Artificial Intelligence in our daily lives",
  "The future of remote work",
  "Technology's role in education",
  "The importance of cybersecurity",
  "How smartphones changed our lives",
  "The benefits of cloud computing",
  "Digital transformation in businesses",
  "The ethics of artificial intelligence",
  "Technology and privacy concerns",
  
  // Social Issues & Current Affairs
  "The importance of environmental conservation",
  "Climate change and its effects",
  "The value of diversity in workplace",
  "Mental health awareness",
  "The impact of globalization",
  "Social media and mental health",
  "The importance of voting",
  "Gender equality in the workplace",
  "The role of youth in society",
  "Sustainable living practices",
  
  // Education & Learning
  "The importance of higher education",
  "Online learning vs traditional classroom",
  "The role of teachers in shaping minds",
  "Lifelong learning benefits",
  "The value of practical experience",
  "How to overcome learning challenges",
  "The importance of critical thinking",
  "Skills needed for future jobs",
  "The role of creativity in education",
  "Learning from failure",
  
  // Success & Motivation
  "What success means to me",
  "The importance of setting goals",
  "How to stay motivated during tough times",
  "The role of persistence in achieving goals",
  "My definition of happiness",
  "The power of positive thinking",
  "How to overcome fear of failure",
  "The importance of self-confidence",
  "Building resilience in life",
  "The value of taking risks",
  
  // Relationships & Communication
  "The importance of friendship",
  "How to be a good listener",
  "The art of effective communication",
  "Building trust in relationships",
  "The role of empathy in understanding others",
  "Conflict resolution strategies",
  "The importance of family support",
  "How to give constructive feedback",
  "The value of networking",
  "Cultural sensitivity in communication",
  
  // Health & Lifestyle
  "The importance of physical fitness",
  "Healthy eating habits",
  "Managing stress in daily life",
  "The benefits of meditation",
  "Work-life balance strategies",
  "The importance of sleep",
  "How to maintain mental wellness",
  "The role of exercise in productivity",
  "Healthy lifestyle choices",
  "The impact of nutrition on performance",
  
  // Innovation & Creativity
  "The importance of thinking outside the box",
  "How creativity drives innovation",
  "The role of curiosity in learning",
  "Embracing change and adaptability",
  "The value of brainstorming",
  "Innovation in problem-solving",
  "The creative process",
  "How to foster creativity in teams",
  "The importance of experimentation",
  "Learning from creative failures",
  
  // Global & Cultural Topics
  "The beauty of cultural diversity",
  "Learning a foreign language benefits",
  "The importance of traveling",
  "Global citizenship responsibilities",
  "Cross-cultural communication",
  "The value of international collaboration",
  "Understanding different perspectives",
  "The role of culture in business",
  "Celebrating cultural festivals",
  "Food as a cultural bridge",
  
  // Additional Popular Topics
  "My favorite season and why",
  "The power of music in life",
  "The importance of time management",
  "How to handle criticism positively",
  "The value of volunteering",
  "My ideal weekend plan",
  "The role of sports in character building",
  "The importance of financial literacy",
  "How to make a good first impression",
  "The art of public speaking"
];

// Function to get a random JAM topic
export const getRandomJAMTopic = (): string => {
  const randomIndex = Math.floor(Math.random() * jamTopics.length);
  return jamTopics[randomIndex];
};

// Function to get multiple random topics (for variety)
export const getMultipleRandomJAMTopics = (count: number = 5): string[] => {
  const shuffled = [...jamTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Categories for better organization
export const jamTopicCategories = {
  personal: jamTopics.slice(0, 10),
  professional: jamTopics.slice(10, 20),
  technology: jamTopics.slice(20, 30),
  social: jamTopics.slice(30, 40),
  education: jamTopics.slice(40, 50),
  success: jamTopics.slice(50, 60),
  relationships: jamTopics.slice(60, 70),
  health: jamTopics.slice(70, 80),
  innovation: jamTopics.slice(80, 90),
  global: jamTopics.slice(90, 100)
};
