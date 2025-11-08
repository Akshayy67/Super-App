/**
 * YouTube Transcript Extraction Service
 * Extracts transcripts from YouTube videos for summarization
 */

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface YouTubeTranscriptResult {
  success: boolean;
  transcript?: string;
  segments?: TranscriptSegment[];
  videoId?: string;
  videoTitle?: string;
  error?: string;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Remove any query parameters that might interfere
  const cleanUrl = url.trim();

  // Match various YouTube URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - youtube.com/watch?v=VIDEO_ID
  // - www.youtube.com/watch?v=VIDEO_ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matches, check if it's already a video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

/**
 * Extract transcript from YouTube video using multiple methods
 * Works client-side with CORS proxies and direct API calls
 */
export async function extractYouTubeTranscript(
  videoId: string,
  lang: string = "en"
): Promise<YouTubeTranscriptResult> {
  if (!videoId) {
    return {
      success: false,
      error: "Video ID is required",
    };
  }

  // Get video title first
  let videoTitle = "";
  try {
    const titleResult = await getYouTubeVideoInfo(videoId);
    if (titleResult.success) {
      videoTitle = titleResult.title || "";
    }
  } catch (e) {
    console.log("Could not fetch video title", e);
  }

  // Method 1: Try using a CORS proxy with YouTube's transcript API
  const transcriptUrls = [
    `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=vtt`,
  ];

  for (const transcriptUrl of transcriptUrls) {
    try {
      // Try with CORS proxy
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(transcriptUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(transcriptUrl)}`,
        transcriptUrl, // Try direct as fallback
      ];

      for (const url of proxyUrls) {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: url.includes("vtt") ? "text/vtt" : "application/xml",
            },
          });

          if (response.ok) {
            const text = await response.text();
            
            // Check if it's VTT format
            if (url.includes("vtt") || text.trim().startsWith("WEBVTT")) {
              const parsed = parseVTT(text);
              if (parsed && parsed.fullText) {
                return {
                  success: true,
                  transcript: parsed.fullText,
                  segments: parsed.segments,
                  videoId: videoId,
                  videoTitle: videoTitle,
                };
              }
            } else {
              // Try parsing as XML
              const parsed = parseYouTubeTranscriptXML(text);
              if (parsed && parsed.fullText) {
                return {
                  success: true,
                  transcript: parsed.fullText,
                  segments: parsed.segments,
                  videoId: videoId,
                  videoTitle: videoTitle,
                };
              }
            }
          }
        } catch (proxyError) {
          // Try next proxy
          continue;
        }
      }
    } catch (error) {
      // Try next URL format
      continue;
    }
  }

  // Method 2: Try backend API endpoint (for production)
  try {
    const response = await fetch(`/api/youtube/transcript?videoId=${videoId}&lang=${lang}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.transcript) {
        return {
          success: true,
          transcript: data.transcript,
          segments: data.segments,
          videoId: videoId,
          videoTitle: data.videoTitle || videoTitle,
        };
      }
    }
  } catch (backendError) {
    // Backend not available, continue to error
    console.log("Backend endpoint not available");
  }

  return {
    success: false,
    error: "Failed to extract transcript. The video may not have captions enabled. Please ensure the video has captions/subtitles available.",
    videoId: videoId,
    videoTitle: videoTitle,
  };
}

/**
 * Parse YouTube transcript XML format
 */
function parseYouTubeTranscriptXML(xmlText: string): {
  fullText: string;
  segments: TranscriptSegment[];
} | null {
  try {
    // Try using DOMParser first
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const textElements = xmlDoc.getElementsByTagName("text");
      const segments: TranscriptSegment[] = [];
      const fullTextParts: string[] = [];

      for (let i = 0; i < textElements.length; i++) {
        const element = textElements[i];
        const text = element.textContent || "";
        const start = parseFloat(element.getAttribute("start") || "0");
        const duration = parseFloat(element.getAttribute("dur") || "0");

        if (text.trim()) {
          segments.push({
            text: text.trim(),
            start: start,
            duration: duration,
          });
          fullTextParts.push(text.trim());
        }
      }

      if (fullTextParts.length > 0) {
        return {
          fullText: fullTextParts.join(" "),
          segments: segments,
        };
      }
    } catch (domError) {
      console.log("DOMParser failed, trying regex parsing");
    }

    // Fallback: Use regex to parse XML
    const textMatches = xmlText.matchAll(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g);
    const segments: TranscriptSegment[] = [];
    const fullTextParts: string[] = [];

    for (const match of textMatches) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = match[3]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (text) {
        segments.push({
          text: text,
          start: start,
          duration: duration,
        });
        fullTextParts.push(text);
      }
    }

    if (fullTextParts.length === 0) {
      return null;
    }

    return {
      fullText: fullTextParts.join(" "),
      segments: segments,
    };
  } catch (error) {
    console.error("Error parsing transcript XML:", error);
    return null;
  }
}

/**
 * Parse WebVTT format
 */
function parseVTT(vttText: string): {
  fullText: string;
  segments: TranscriptSegment[];
} | null {
  try {
    const lines = vttText.split("\n");
    const segments: TranscriptSegment[] = [];
    const fullTextParts: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line.startsWith("WEBVTT") || line === "" || line.startsWith("NOTE")) {
        continue;
      }
      
      // Match timestamp line: 00:00:10.000 --> 00:00:15.000
      // Also handle formats like: 00:10.000 --> 00:15.000 (without hours)
      const timeMatch = line.match(/(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})/);
      
      if (timeMatch) {
        const startHours = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
        const startMinutes = parseInt(timeMatch[2]);
        const startSeconds = parseInt(timeMatch[3]);
        const startMs = parseInt(timeMatch[4]);
        const endHours = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
        const endMinutes = parseInt(timeMatch[6]);
        const endSeconds = parseInt(timeMatch[7]);
        const endMs = parseInt(timeMatch[8]);

        const start = startHours * 3600 + startMinutes * 60 + startSeconds + startMs / 1000;
        const end = endHours * 3600 + endMinutes * 60 + endSeconds + endMs / 1000;
        const duration = end - start;

        // Get the text on the next few lines (VTT can have multiple lines of text)
        let textLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim() && !lines[j].trim().match(/^(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})\s*-->/)) {
          const textLine = lines[j].trim();
          // Remove VTT tags like <c>, </c>, etc.
          const cleanText = textLine
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
          
          if (cleanText && !cleanText.match(/^\d+$/) && !cleanText.startsWith("WEBVTT")) {
            textLines.push(cleanText);
          }
          j++;
        }

        if (textLines.length > 0) {
          const text = textLines.join(" ");
          segments.push({
            text: text,
            start: start,
            duration: duration,
          });
          fullTextParts.push(text);
        }
      }
    }

    if (fullTextParts.length === 0) {
      return null;
    }

    return {
      fullText: fullTextParts.join(" "),
      segments: segments,
    };
  } catch (error) {
    console.error("Error parsing VTT:", error);
    return null;
  }
}

/**
 * Extract transcript using YouTube Transcript API (client-side alternative)
 * This uses a service that works entirely in the browser
 */
export async function extractYouTubeTranscriptClientSide(
  videoId: string
): Promise<YouTubeTranscriptResult> {
  try {
    // Use a client-side library approach
    // We'll dynamically load youtube-transcript if available, or use an API
    
    // Try using YouTube's internal API endpoints (may be blocked by CORS)
    // Fallback to a backend service
    
    // For a fully functional solution, we need one of:
    // 1. A backend endpoint that uses yt-dlp or youtube-transcript library
    // 2. A CORS-enabled proxy service
    // 3. A third-party API service
    
    // For now, we'll create a solution that works with a backend
    // The frontend will call the backend, which handles the transcript extraction
    
    return {
      success: false,
      error: "Client-side transcript extraction requires a backend service. Please configure the YouTube transcript API endpoint.",
      videoId: videoId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to extract transcript",
      videoId: videoId,
    };
  }
}

/**
 * Get video information from YouTube
 */
export async function getYouTubeVideoInfo(
  videoId: string
): Promise<{
  success: boolean;
  title?: string;
  thumbnail?: string;
  error?: string;
}> {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl);
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        title: data.title,
        thumbnail: data.thumbnail_url,
      };
    }
    
    return {
      success: false,
      error: "Failed to fetch video information",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch video information",
    };
  }
}

