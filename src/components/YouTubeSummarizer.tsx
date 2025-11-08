import React, { useState } from "react";
import {
  Youtube,
  Loader,
  ExternalLink,
} from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import {
  extractVideoId,
  extractYouTubeTranscript,
  getYouTubeVideoInfo,
} from "../utils/youtubeTranscriptService";

interface SummaryResult {
  content: string;
  timestamp: string;
  metadata?: {
    videoId?: string;
    videoTitle?: string;
    videoUrl?: string;
  };
}

export const YouTubeSummarizer: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingTranscript, setIsExtractingTranscript] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    title?: string;
    thumbnail?: string;
    videoId?: string;
  } | null>(null);
  const [results, setResults] = useState<SummaryResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle YouTube URL validation and video info fetching
  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    setVideoInfo(null);
    setError(null);

    if (!url.trim()) {
      return;
    }

    const videoId = extractVideoId(url);
    if (videoId) {
      try {
        const info = await getYouTubeVideoInfo(videoId);
        if (info.success) {
          setVideoInfo({
            title: info.title,
            thumbnail: info.thumbnail,
            videoId: videoId,
          });
        } else {
          setError("Could not fetch video information. Please check the URL.");
        }
      } catch (error) {
        console.error("Error fetching video info:", error);
        setError("Error fetching video information.");
      }
    } else {
      setError("Invalid YouTube URL. Please enter a valid YouTube video URL.");
    }
  };

  const handleSummarize = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError("Invalid YouTube URL. Please enter a valid YouTube video URL.");
      return;
    }

    setIsLoading(true);
    setIsExtractingTranscript(true);
    setError(null);

    try {
      // First, ensure we have video info
      let videoTitle = videoInfo?.title || "";
      if (!videoTitle) {
        const infoResult = await getYouTubeVideoInfo(videoId);
        if (infoResult.success && infoResult.title) {
          videoTitle = infoResult.title;
          setVideoInfo({
            title: infoResult.title,
            thumbnail: infoResult.thumbnail,
            videoId: videoId,
          });
        }
      }

      // Try to extract transcript first
      const transcriptResult = await extractYouTubeTranscript(videoId);

      let summaryText = "";

      if (transcriptResult.success && transcriptResult.transcript) {
        // Use transcript for summary
        setIsExtractingTranscript(false);
        const summaryResult = await unifiedAIService.summarizeText(
          transcriptResult.transcript
        );
        
        if (summaryResult.success && summaryResult.data) {
          summaryText = summaryResult.data;
        } else {
          throw new Error("Failed to summarize transcript");
        }
      } else {
        // Fallback: Use Gemini AI to generate summary based on video metadata
        setIsExtractingTranscript(false);
        
        const geminiPrompt = videoTitle
          ? `You are an AI assistant that provides insightful summaries and analysis of YouTube videos. Based on the following video information, provide a comprehensive summary and analysis.

Video Title: ${videoTitle}
Video URL: ${youtubeUrl}
Video ID: ${videoId}

Please provide:
1. A detailed summary of what this video is likely about based on the title
2. Key topics and concepts that would be covered
3. Main takeaways and insights
4. Who would benefit from watching this video
5. Potential questions this video might answer

Make the summary informative, engaging, and helpful for someone who wants to understand the video content without watching it.`
          : `You are an AI assistant. Provide a comprehensive analysis and summary for this YouTube video.

Video URL: ${youtubeUrl}
Video ID: ${videoId}

Please provide:
1. What this video might be about
2. Key topics likely covered
3. Main insights and takeaways
4. Who would benefit from this content
5. Potential learning outcomes

Make it informative and helpful.`;

        const geminiResult = await unifiedAIService.generateResponse(geminiPrompt);
        
        if (geminiResult.success && geminiResult.data) {
          summaryText = geminiResult.data + "\n\n[Note: This summary was generated using AI based on video metadata. For the most accurate summary, please watch the video or ensure captions are enabled.]";
        } else {
          throw new Error("Failed to generate AI summary");
        }
      }

      if (summaryText) {
        const newResult: SummaryResult = {
          content: summaryText,
          timestamp: new Date().toISOString(),
          metadata: {
            videoId: videoId,
            videoTitle: videoTitle || transcriptResult.videoTitle,
            videoUrl: youtubeUrl,
          },
        };
        setResults((prev) => [newResult, ...prev]);
        // Don't clear URL - user might want to watch the video
      } else {
        setError("Failed to generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error processing YouTube video:", error);
      setError(
        "An error occurred while processing the YouTube video. Using AI to generate a summary based on available information..."
      );
      
      // Last resort: Try Gemini with minimal info
      try {
        const fallbackPrompt = `Provide a summary and analysis for this YouTube video: ${youtubeUrl}. Include what the video might be about, key topics, and main insights.`;
        const fallbackResult = await unifiedAIService.generateResponse(fallbackPrompt);
        
        if (fallbackResult.success && fallbackResult.data) {
          const videoId = extractVideoId(youtubeUrl);
          const newResult: SummaryResult = {
            content: fallbackResult.data,
            timestamp: new Date().toISOString(),
            metadata: {
              videoId: videoId || undefined,
              videoTitle: videoInfo?.title,
              videoUrl: youtubeUrl,
            },
          };
          setResults((prev) => [newResult, ...prev]);
          setError(null);
        }
      } catch (fallbackError) {
        setError("Failed to generate summary. Please check your internet connection and try again.");
      }
    } finally {
      setIsLoading(false);
      setIsExtractingTranscript(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              YouTube Summarizer
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Extract and summarize YouTube video transcripts using AI
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSummarize}
                disabled={
                  isLoading || isExtractingTranscript || !youtubeUrl.trim()
                }
                className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isExtractingTranscript ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {isExtractingTranscript
                      ? "Extracting..."
                      : "Summarizing..."}
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4 mr-2" />
                    Summarize
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 whitespace-pre-line">{error}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                  💡 Note: Using AI to generate summary based on video metadata. Watch the video above for full content.
                </p>
              </div>
            )}
          </div>

          {videoInfo && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="w-32 h-24 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                    {videoInfo.title || "YouTube Video"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Video ID: {videoInfo.videoId}
                  </p>
                </div>
              </div>
              
              {/* Embedded Video Player */}
              {videoInfo.videoId && (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoInfo.videoId}`}
                    title={videoInfo.title || "YouTube video player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {isExtractingTranscript && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Extracting transcript from video...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-auto p-6">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <Youtube className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ready to summarize YouTube videos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter a YouTube video URL above to generate an AI-powered summary. You can also watch the video directly in the player.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Video Summary
                      </h3>
                    </div>
                    {result.metadata && (
                      <div className="mt-2 space-y-3">
                        {result.metadata.videoTitle && (
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {result.metadata.videoTitle}
                          </p>
                        )}
                        
                        {/* Embedded Video Player in Results */}
                        {result.metadata.videoId && (
                          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={`https://www.youtube.com/embed/${result.metadata.videoId}`}
                              title={result.metadata.videoTitle || "YouTube video player"}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        )}
                        
                        {result.metadata.videoUrl && (
                          <a
                            href={result.metadata.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 inline-flex"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Watch on YouTube
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {result.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

