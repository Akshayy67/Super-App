import { InterviewPerformanceData } from "./performanceAnalytics";
import { unifiedAIService } from "./aiConfig";

export interface AIAnalysisResult {
  overallInsights: string[];
  strengthsAnalysis: string[];
  weaknessesAnalysis: string[];
  improvementRecommendations: string[];
  careerGuidance: string[];
  nextStepsAction: string[];
  confidenceLevel: number;
  readinessScore: number;
  marketComparison: string;
  skillGaps: string[];
  learningPath: string[];
}

export interface TrendAnalysis {
  performanceTrend: "improving" | "declining" | "stable";
  trendConfidence: number;
  keyMetricChanges: {
    metric: string;
    change: number;
    significance: "high" | "medium" | "low";
  }[];
  predictedNextScore: number;
  timeToImprovement: string;
}

export interface PersonalizedInsights {
  roleSpecificAdvice: string[];
  industryTrends: string[];
  skillDemand: string[];
  salaryInsights: string[];
  competitiveAdvantage: string[];
}

export class EnhancedAIAnalytics {
  private static instance: EnhancedAIAnalytics;

  public static getInstance(): EnhancedAIAnalytics {
    if (!EnhancedAIAnalytics.instance) {
      EnhancedAIAnalytics.instance = new EnhancedAIAnalytics();
    }
    return EnhancedAIAnalytics.instance;
  }

  /**
   * Normalize performance data to ensure all required fields exist
   */
  private normalizePerformanceData(
    performance: InterviewPerformanceData
  ): InterviewPerformanceData {
    return {
      ...performance,
      detailedMetrics: {
        confidence: performance.detailedMetrics?.confidence || 75,
        clarity: performance.detailedMetrics?.clarity || 80,
        professionalism: performance.detailedMetrics?.professionalism || 85,
        engagement: performance.detailedMetrics?.engagement || 80,
        adaptability: performance.detailedMetrics?.adaptability || 75,
        ...performance.detailedMetrics,
      },
      speechAnalysis: {
        wordsPerMinute: performance.speechAnalysis?.wordsPerMinute || 150,
        fillerWords: performance.speechAnalysis?.fillerWords || 5,
        pauseFrequency: performance.speechAnalysis?.pauseFrequency || 8,
        volumeConsistency: performance.speechAnalysis?.volumeConsistency || 85,
        clarityScore: performance.speechAnalysis?.clarityScore || 80,
        ...performance.speechAnalysis,
      },
      bodyLanguageAnalysis: {
        eyeContact: performance.bodyLanguageAnalysis?.eyeContact || 85,
        posture: performance.bodyLanguageAnalysis?.posture || 80,
        gestures: performance.bodyLanguageAnalysis?.gestures || 75,
        facialExpressions:
          performance.bodyLanguageAnalysis?.facialExpressions || 80,
        overallConfidence:
          performance.bodyLanguageAnalysis?.overallConfidence || 80,
        ...performance.bodyLanguageAnalysis,
      },
      strengths: performance.strengths || [
        "Good foundational knowledge",
        "Professional demeanor",
      ],
      weaknesses: performance.weaknesses || [
        "Could improve clarity",
        "Practice specific examples",
      ],
      recommendations: performance.recommendations || [
        "Practice technical explanations",
        "Prepare more examples",
      ],
    };
  }

  /**
   * Analyze a single interview performance with AI insights
   */
  async analyzeInterviewPerformance(
    performance: InterviewPerformanceData
  ): Promise<AIAnalysisResult> {
    try {
      // Validate and normalize performance data
      const normalizedPerformance = this.normalizePerformanceData(performance);

      const analysisPrompt = this.buildPerformanceAnalysisPrompt(
        normalizedPerformance
      );
      const response = await unifiedAIService.generateResponse(analysisPrompt);

      if (response.success && response.data) {
        return this.parseAIAnalysisResponse(response.data);
      }

      return this.getFallbackAnalysis(performance);
    } catch (error) {
      console.error("AI analysis failed:", error);
      return this.getFallbackAnalysis(performance);
    }
  }

  /**
   * Analyze performance trends across multiple interviews
   */
  async analyzeTrends(
    performanceHistory: InterviewPerformanceData[]
  ): Promise<TrendAnalysis> {
    if (performanceHistory.length < 2) {
      return this.getMinimalTrendAnalysis();
    }

    try {
      const trendPrompt = this.buildTrendAnalysisPrompt(performanceHistory);
      const response = await unifiedAIService.generateResponse(trendPrompt);

      if (response.success && response.data) {
        return this.parseTrendAnalysisResponse(
          response.data,
          performanceHistory
        );
      }

      return this.getFallbackTrendAnalysis(performanceHistory);
    } catch (error) {
      console.error("Trend analysis failed:", error);
      return this.getFallbackTrendAnalysis(performanceHistory);
    }
  }

  /**
   * Generate personalized insights based on role and performance
   */
  async generatePersonalizedInsights(
    performance: InterviewPerformanceData,
    performanceHistory: InterviewPerformanceData[]
  ): Promise<PersonalizedInsights> {
    try {
      const insightsPrompt = this.buildPersonalizedInsightsPrompt(
        performance,
        performanceHistory
      );
      const response = await unifiedAIService.generateResponse(insightsPrompt);

      if (response.success && response.data) {
        return this.parsePersonalizedInsightsResponse(response.data);
      }

      return this.getFallbackPersonalizedInsights(performance);
    } catch (error) {
      console.error("Personalized insights generation failed:", error);
      return this.getFallbackPersonalizedInsights(performance);
    }
  }

  /**
   * Generate comprehensive AI-powered report
   */
  async generateComprehensiveReport(
    performance: InterviewPerformanceData,
    performanceHistory: InterviewPerformanceData[]
  ): Promise<{
    analysis: AIAnalysisResult;
    trends: TrendAnalysis;
    insights: PersonalizedInsights;
    summary: string;
  }> {
    const [analysis, trends, insights] = await Promise.all([
      this.analyzeInterviewPerformance(performance),
      this.analyzeTrends(performanceHistory),
      this.generatePersonalizedInsights(performance, performanceHistory),
    ]);

    const summary = await this.generateExecutiveSummary(
      performance,
      analysis,
      trends,
      insights
    );

    return {
      analysis,
      trends,
      insights,
      summary,
    };
  }

  private buildPerformanceAnalysisPrompt(
    performance: InterviewPerformanceData
  ): string {
    return `
Analyze this interview performance data and provide comprehensive insights:

**Interview Details:**
- Role: ${performance.role}
- Difficulty: ${performance.difficulty}
- Duration: ${Math.round(performance.duration / 60)} minutes
- Overall Score: ${performance.overallScore}/100

**Performance Scores:**
- Technical: ${performance.technicalScore}/100
- Communication: ${performance.communicationScore}/100
- Behavioral: ${performance.behavioralScore}/100

**Speech Analysis:**
- Confidence: ${
      performance.speechAnalysis?.confidenceScore?.overall ||
      performance.detailedMetrics?.confidence ||
      75
    }/100
- Clarity: ${
      performance.speechAnalysis?.pronunciationAssessment?.clarity ||
      performance.detailedMetrics?.clarity ||
      performance.speechAnalysis?.clarityScore ||
      80
    }/100
- Pace: ${
      performance.speechAnalysis?.paceAnalysis?.wordsPerMinute ||
      performance.speechAnalysis?.wordsPerMinute ||
      150
    } WPM
- Filler Words: ${
      performance.speechAnalysis?.fillerWords?.percentage ||
      performance.speechAnalysis?.fillerWords ||
      5
    }%

**Body Language:**
- Eye Contact: ${
      performance.bodyLanguageAnalysis?.eyeContact?.percentage ||
      performance.bodyLanguageAnalysis?.eyeContact ||
      85
    }%
- Posture Score: ${
      performance.bodyLanguageAnalysis?.posture?.score ||
      performance.bodyLanguageAnalysis?.posture ||
      80
    }/100
- Professional Score: ${
      performance.bodyLanguageAnalysis?.overallBodyLanguage
        ?.professionalismScore ||
      performance.bodyLanguageAnalysis?.overallConfidence ||
      performance.detailedMetrics?.professionalism ||
      85
    }/100

**Detailed Metrics:**
- Confidence: ${performance.detailedMetrics?.confidence || 75}/100
- Clarity: ${performance.detailedMetrics?.clarity || 80}/100
- Professionalism: ${performance.detailedMetrics?.professionalism || 85}/100
- Engagement: ${performance.detailedMetrics?.engagement || 80}/100
- Adaptability: ${performance.detailedMetrics?.adaptability || 75}/100

Please provide analysis in this JSON format:
{
  "overallInsights": ["insight1", "insight2", "insight3"],
  "strengthsAnalysis": ["strength1", "strength2", "strength3"],
  "weaknessesAnalysis": ["weakness1", "weakness2", "weakness3"],
  "improvementRecommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "careerGuidance": ["guidance1", "guidance2", "guidance3"],
  "nextStepsAction": ["action1", "action2", "action3"],
  "confidenceLevel": 85,
  "readinessScore": 78,
  "marketComparison": "Above average for ${performance.role} interviews",
  "skillGaps": ["gap1", "gap2"],
  "learningPath": ["step1", "step2", "step3"]
}

Focus on actionable insights and specific recommendations for improvement.
`;
  }

  private buildTrendAnalysisPrompt(
    performanceHistory: InterviewPerformanceData[]
  ): string {
    const recentPerformances = performanceHistory.slice(-5);
    const scores = recentPerformances.map((p) => ({
      date: p.timestamp,
      overall: p.overallScore,
      technical: p.technicalScore,
      communication: p.communicationScore,
      behavioral: p.behavioralScore,
    }));

    return `
Analyze the performance trend from these interview scores:

${JSON.stringify(scores, null, 2)}

Provide trend analysis in this JSON format:
{
  "performanceTrend": "improving|declining|stable",
  "trendConfidence": 85,
  "keyMetricChanges": [
    {"metric": "Overall Score", "change": 5.2, "significance": "medium"},
    {"metric": "Technical Skills", "change": -2.1, "significance": "low"}
  ],
  "predictedNextScore": 82,
  "timeToImprovement": "2-3 weeks with focused practice"
}

Analyze the trajectory and provide specific insights about improvement patterns.
`;
  }

  private buildPersonalizedInsightsPrompt(
    performance: InterviewPerformanceData,
    performanceHistory: InterviewPerformanceData[]
  ): string {
    return `
Generate personalized career insights for a ${
      performance.role
    } candidate with this performance profile:

Current Performance: ${performance.overallScore}/100
Interview History: ${performanceHistory.length} interviews completed
Average Score: ${
      performanceHistory.reduce((sum, p) => sum + p.overallScore, 0) /
      performanceHistory.length
    }

Provide insights in this JSON format:
{
  "roleSpecificAdvice": ["advice1", "advice2", "advice3"],
  "industryTrends": ["trend1", "trend2"],
  "skillDemand": ["skill1", "skill2", "skill3"],
  "salaryInsights": ["insight1", "insight2"],
  "competitiveAdvantage": ["advantage1", "advantage2"]
}

Focus on current market conditions and specific advice for ${
      performance.role
    } roles.
`;
  }

  private parseAIAnalysisResponse(response: string): AIAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          overallInsights: parsed.overallInsights || [],
          strengthsAnalysis: parsed.strengthsAnalysis || [],
          weaknessesAnalysis: parsed.weaknessesAnalysis || [],
          improvementRecommendations: parsed.improvementRecommendations || [],
          careerGuidance: parsed.careerGuidance || [],
          nextStepsAction: parsed.nextStepsAction || [],
          confidenceLevel: parsed.confidenceLevel || 70,
          readinessScore: parsed.readinessScore || 70,
          marketComparison: parsed.marketComparison || "Average performance",
          skillGaps: parsed.skillGaps || [],
          learningPath: parsed.learningPath || [],
        };
      }
    } catch (error) {
      console.error("Failed to parse AI analysis response:", error);
    }

    // Fallback: parse text response
    return this.parseTextResponse(response);
  }

  private parseTextResponse(response: string): AIAnalysisResult {
    const lines = response.split("\n").filter((line) => line.trim());

    return {
      overallInsights: this.extractSection(lines, "insights", 3),
      strengthsAnalysis: this.extractSection(lines, "strengths", 3),
      weaknessesAnalysis: this.extractSection(lines, "weaknesses", 3),
      improvementRecommendations: this.extractSection(
        lines,
        "recommendations",
        5
      ),
      careerGuidance: this.extractSection(lines, "guidance", 3),
      nextStepsAction: this.extractSection(lines, "actions", 3),
      confidenceLevel: 75,
      readinessScore: 75,
      marketComparison: "Performance analysis completed",
      skillGaps: this.extractSection(lines, "gaps", 2),
      learningPath: this.extractSection(lines, "learning", 3),
    };
  }

  private extractSection(
    lines: string[],
    keyword: string,
    count: number
  ): string[] {
    const section: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(keyword)) {
        inSection = true;
        continue;
      }

      if (
        inSection &&
        (line.startsWith("-") || line.startsWith("•") || line.match(/^\d+\./))
      ) {
        section.push(line.replace(/^[-•\d.\s]+/, "").trim());
        if (section.length >= count) break;
      }
    }

    return section.length > 0 ? section : [`${keyword} analysis completed`];
  }

  private parseTrendAnalysisResponse(
    response: string,
    performanceHistory: InterviewPerformanceData[]
  ): TrendAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          performanceTrend: parsed.performanceTrend || "stable",
          trendConfidence: parsed.trendConfidence || 70,
          keyMetricChanges: parsed.keyMetricChanges || [],
          predictedNextScore: parsed.predictedNextScore || 75,
          timeToImprovement: parsed.timeToImprovement || "Continue practicing",
        };
      }
    } catch (error) {
      console.error("Failed to parse trend analysis:", error);
    }

    return this.getFallbackTrendAnalysis(performanceHistory);
  }

  private parsePersonalizedInsightsResponse(
    response: string
  ): PersonalizedInsights {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          roleSpecificAdvice: parsed.roleSpecificAdvice || [],
          industryTrends: parsed.industryTrends || [],
          skillDemand: parsed.skillDemand || [],
          salaryInsights: parsed.salaryInsights || [],
          competitiveAdvantage: parsed.competitiveAdvantage || [],
        };
      }
    } catch (error) {
      console.error("Failed to parse personalized insights:", error);
    }

    return {
      roleSpecificAdvice: ["Continue practicing interview skills"],
      industryTrends: ["Market demand remains strong"],
      skillDemand: ["Technical skills are highly valued"],
      salaryInsights: ["Competitive compensation available"],
      competitiveAdvantage: ["Strong foundation for growth"],
    };
  }

  private async generateExecutiveSummary(
    performance: InterviewPerformanceData,
    analysis: AIAnalysisResult,
    trends: TrendAnalysis,
    insights: PersonalizedInsights
  ): Promise<string> {
    const summaryPrompt = `
Create an executive summary for this interview performance:

Performance Score: ${performance.overallScore}/100
Trend: ${trends.performanceTrend}
Readiness Score: ${analysis.readinessScore}/100

Key Strengths: ${analysis.strengthsAnalysis.slice(0, 2).join(", ")}
Key Areas for Improvement: ${analysis.weaknessesAnalysis.slice(0, 2).join(", ")}

Provide a concise 2-3 sentence executive summary highlighting the most important insights.
`;

    try {
      const response = await unifiedAIService.generateResponse(summaryPrompt);
      if (response.success && response.data) {
        return response.data.trim();
      }
    } catch (error) {
      console.error("Failed to generate executive summary:", error);
    }

    return `Performance score of ${performance.overallScore}/100 shows ${
      trends.performanceTrend
    } trend. Focus on ${
      analysis.weaknessesAnalysis[0] || "continued improvement"
    } while leveraging ${
      analysis.strengthsAnalysis[0] || "existing strengths"
    }.`;
  }

  private getFallbackAnalysis(
    performance: InterviewPerformanceData
  ): AIAnalysisResult {
    return {
      overallInsights: [
        `Overall performance score of ${
          performance.overallScore
        }/100 indicates ${
          performance.overallScore >= 80
            ? "strong"
            : performance.overallScore >= 60
            ? "good"
            : "developing"
        } interview skills`,
        `Technical competency at ${performance.technicalScore}/100 shows ${
          performance.technicalScore >= 75 ? "solid" : "room for improvement"
        } foundation`,
        `Communication skills rated ${
          performance.communicationScore
        }/100 demonstrate ${
          performance.communicationScore >= 75 ? "effective" : "developing"
        } presentation abilities`,
      ],
      strengthsAnalysis:
        performance.strengths && performance.strengths.length > 0
          ? performance.strengths
          : [
              "Demonstrates good foundational knowledge",
              "Shows willingness to engage in discussion",
              "Maintains professional demeanor",
            ],
      weaknessesAnalysis:
        performance.weaknesses && performance.weaknesses.length > 0
          ? performance.weaknesses
          : [
              "Could improve response clarity",
              "May benefit from more specific examples",
              "Consider practicing technical explanations",
            ],
      improvementRecommendations:
        performance.recommendations && performance.recommendations.length > 0
          ? performance.recommendations
          : [
              "Practice explaining complex concepts simply",
              "Prepare more specific examples from experience",
              "Work on maintaining eye contact",
              "Reduce use of filler words",
              "Practice common interview questions",
            ],
      careerGuidance: [
        `Continue developing skills relevant to ${performance.role} positions`,
        "Consider seeking feedback from industry professionals",
        "Build a portfolio of relevant projects",
      ],
      nextStepsAction: [
        "Schedule follow-up practice sessions",
        "Focus on identified weak areas",
        "Prepare for real interviews with confidence",
      ],
      confidenceLevel: Math.min(
        (performance.detailedMetrics?.confidence || 75) + 10,
        100
      ),
      readinessScore: performance.overallScore,
      marketComparison: `${
        performance.overallScore >= 80
          ? "Above"
          : performance.overallScore >= 60
          ? "At"
          : "Below"
      } average for ${performance.role} interviews`,
      skillGaps: [
        performance.technicalScore < 70 ? "Technical knowledge depth" : null,
        performance.communicationScore < 70 ? "Communication clarity" : null,
      ].filter(Boolean) as string[],
      learningPath: [
        "Continue regular interview practice",
        "Study industry-specific topics",
        "Develop storytelling skills for behavioral questions",
      ],
    };
  }

  private getFallbackTrendAnalysis(
    performanceHistory: InterviewPerformanceData[]
  ): TrendAnalysis {
    if (performanceHistory.length < 2) {
      return this.getMinimalTrendAnalysis();
    }

    const recent = performanceHistory.slice(-3);
    const scores = recent.map((p) => p.overallScore);
    const avgChange =
      scores.length > 1
        ? (scores[scores.length - 1] - scores[0]) / (scores.length - 1)
        : 0;

    return {
      performanceTrend:
        avgChange > 2 ? "improving" : avgChange < -2 ? "declining" : "stable",
      trendConfidence: 75,
      keyMetricChanges: [
        {
          metric: "Overall Score",
          change: avgChange,
          significance:
            Math.abs(avgChange) > 5
              ? "high"
              : Math.abs(avgChange) > 2
              ? "medium"
              : "low",
        },
      ],
      predictedNextScore: Math.max(
        0,
        Math.min(100, scores[scores.length - 1] + avgChange)
      ),
      timeToImprovement:
        avgChange > 0
          ? "Continue current practice routine"
          : "Focus on identified weak areas",
    };
  }

  private getMinimalTrendAnalysis(): TrendAnalysis {
    return {
      performanceTrend: "stable",
      trendConfidence: 50,
      keyMetricChanges: [],
      predictedNextScore: 75,
      timeToImprovement: "Complete more interviews to establish trends",
    };
  }

  private getFallbackPersonalizedInsights(
    performance: InterviewPerformanceData
  ): PersonalizedInsights {
    return {
      roleSpecificAdvice: [
        `Focus on ${performance.role}-specific technical skills`,
        "Practice common interview scenarios for your role",
        "Research company-specific requirements",
      ],
      industryTrends: [
        "Remote work capabilities increasingly important",
        "Continuous learning mindset highly valued",
      ],
      skillDemand: [
        "Technical proficiency remains crucial",
        "Communication skills in high demand",
        "Problem-solving abilities essential",
      ],
      salaryInsights: [
        "Performance improvements can lead to better offers",
        "Market rates vary by location and experience",
      ],
      competitiveAdvantage: [
        "Strong interview preparation sets you apart",
        "Consistent practice builds confidence",
      ],
    };
  }
}

export const enhancedAIAnalytics = EnhancedAIAnalytics.getInstance();
