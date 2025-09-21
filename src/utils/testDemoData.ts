/**
 * Simple test script to populate demo data
 * Can be run in browser console
 */

import { createDemoInterviewData } from "./demoData";

// Global function to create demo data
(window as any).createDemoData = async () => {
  try {
    console.log("🎯 Starting demo data creation...");
    const interviews = await createDemoInterviewData(5);
    console.log("✅ Demo data created successfully!", interviews);
    return interviews;
  } catch (error) {
    console.error("❌ Failed to create demo data:", error);
    throw error;
  }
};

// Global function to test AI insights
(window as any).testAIInsights = async () => {
  try {
    const { unifiedAnalyticsStorage } = await import("./unifiedAnalyticsStorage");
    const { enhancedAIAnalytics } = await import("./enhancedAIAnalytics");
    
    console.log("🔍 Testing AI insights...");
    
    // Get performance history
    const history = await unifiedAnalyticsStorage.getPerformanceHistory();
    console.log("📊 Performance history:", history);
    
    if (history.length === 0) {
      console.log("⚠️ No performance data found. Creating demo data first...");
      await (window as any).createDemoData();
      return;
    }
    
    const latestPerformance = history[0];
    console.log("🎯 Testing with latest performance:", latestPerformance);
    
    // Test AI analysis
    console.log("🤖 Generating AI analysis...");
    const analysis = await enhancedAIAnalytics.analyzeInterviewPerformance(latestPerformance);
    console.log("✅ AI Analysis:", analysis);
    
    // Test trend analysis
    console.log("📈 Generating trend analysis...");
    const trends = await enhancedAIAnalytics.analyzeTrends(history);
    console.log("✅ Trend Analysis:", trends);
    
    // Test personalized insights
    console.log("💡 Generating personalized insights...");
    const insights = await enhancedAIAnalytics.generatePersonalizedInsights(latestPerformance, history);
    console.log("✅ Personalized Insights:", insights);
    
    return { analysis, trends, insights };
  } catch (error) {
    console.error("❌ AI insights test failed:", error);
    throw error;
  }
};

console.log("🛠️ Demo data test utilities loaded!");
console.log("📝 Available functions:");
console.log("  - createDemoData(): Create 5 demo interview records");
console.log("  - testAIInsights(): Test AI insights generation");
