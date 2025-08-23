import React from "react";
import { getPracticeLinks } from "./bank/enhanced/practiceLinks";

export const TestPracticeLinks: React.FC = () => {
  React.useEffect(() => {
    console.log("=== Testing Practice Links ===");

    // Test a few different question IDs
    const testIds = [
      "enhanced-array-1",
      "enhanced-array-2",
      "enhanced-string-1",
    ];

    testIds.forEach((id) => {
      const links = getPracticeLinks(id);
      console.log(`${id}:`, links);
    });
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
      <h3 className="font-bold">Practice Links Debug</h3>
      <p>Check console for debug output</p>
      <div>
        <h4>Test enhanced-array-1:</h4>
        {(() => {
          const links = getPracticeLinks("enhanced-array-1");
          return (
            <div>
              <p>LeetCode: {links?.leetcode || "Not found"}</p>
              <p>GeeksforGeeks: {links?.geeksforgeeks || "Not found"}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
