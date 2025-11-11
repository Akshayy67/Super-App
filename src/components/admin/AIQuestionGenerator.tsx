import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface AIQuestionGeneratorProps {
  onGenerate: (question: any) => void;
}

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setGenerating(true);
    try {
      // Call Gemini API
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a daily challenge question based on this prompt: "${prompt}"

Please respond in JSON format with the following structure:
{
  "type": "coding" | "puzzle" | "aptitude",
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"] (only for aptitude MCQ),
  "correctAnswer": "The correct answer",
  "explanation": "Detailed explanation of the answer",
  "difficulty": "easy" | "medium" | "hard",
  "tags": ["tag1", "tag2"],
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "starterCode": "// Starter code for coding questions (if type is coding)",
  "testCases": [{"input": "example input", "output": "expected output"}] (if type is coding)
}

Make sure the question is challenging, educational, and interesting!`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const textResponse = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setGeneratedQuestion(parsed);
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (error: any) {
      console.error('Error generating question:', error);
      alert('Failed to generate question: ' + (error.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedQuestion) {
      onGenerate(generatedQuestion);
      setGeneratedQuestion(null);
      setPrompt('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedQuestion, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700">
      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6" />
        AI Question Generator
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt (Describe the question you want)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Example: Create a medium difficulty coding question about binary trees that tests understanding of tree traversal..."
            className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Question
            </>
          )}
        </button>

        {generatedQuestion && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-300 dark:border-purple-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Generated Question</h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Type:</span> {generatedQuestion.type}
              </div>
              <div>
                <span className="font-semibold">Difficulty:</span> {generatedQuestion.difficulty}
              </div>
              <div>
                <span className="font-semibold">Question:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{generatedQuestion.question}</p>
              </div>
              {generatedQuestion.hints && (
                <div>
                  <span className="font-semibold">Hints:</span> {generatedQuestion.hints.length}
                </div>
              )}
              {generatedQuestion.starterCode && (
                <div>
                  <span className="font-semibold">Starter Code:</span>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                    {generatedQuestion.starterCode}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUseGenerated}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Use This Question
              </button>
              <button
                onClick={() => setGeneratedQuestion(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          <p>💡 Tip: Be specific in your prompt for better results!</p>
          <p className="mt-1">Examples:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>"Create a hard coding question about dynamic programming"</li>
            <li>"Generate a puzzle about logic and deduction"</li>
            <li>"Make an aptitude question testing probability concepts"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
