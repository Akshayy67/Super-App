/**
 * YouTube Transcript API Endpoint
 * Extracts transcripts from YouTube videos
 */

interface TranscriptResponse {
  success: boolean;
  transcript?: string;
  segments?: Array<{ text: string; start: number; duration: number }>;
  videoId?: string;
  videoTitle?: string;
  error?: string;
}

// @ts-nocheck - Vercel serverless function
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const videoId = req.query?.videoId || req.body?.videoId;
    const lang = req.query?.lang || req.body?.lang || 'en';

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    // Extract transcript using YouTube's API
    const transcript = await fetchYouTubeTranscript(videoId, lang);

    if (!transcript.success) {
      return res.status(400).json(transcript);
    }

    return res.status(200).json(transcript);
  } catch (error: any) {
    console.error('Error extracting YouTube transcript:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract transcript',
    });
  }
}

/**
 * Fetch YouTube transcript using multiple methods
 */
async function fetchYouTubeTranscript(
  videoId: string,
  lang: string = 'en'
): Promise<TranscriptResponse> {
  try {
    // Method 1: Try YouTube's timedtext API directly
    const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`;
    
    try {
      const response = await fetch(transcriptUrl, {
        headers: {
          'Accept': 'application/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        const xmlText = await response.text();
        const parsed = parseYouTubeTranscriptXML(xmlText);
        
        if (parsed && parsed.fullText) {
          // Try to get video title
          let videoTitle = '';
          try {
            const oEmbedResponse = await fetch(
              `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            );
            if (oEmbedResponse.ok) {
              const oEmbedData = await oEmbedResponse.json();
              videoTitle = oEmbedData.title || '';
            }
          } catch (e) {
            // Ignore title fetch errors
          }

          return {
            success: true,
            transcript: parsed.fullText,
            segments: parsed.segments,
            videoId: videoId,
            videoTitle: videoTitle,
          };
        }
      }
    } catch (error) {
      console.log('Direct API method failed, trying alternative');
    }

    // Method 2: Try with auto-generated captions
    try {
      const autoUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=srv3`;
      const response = await fetch(autoUrl, {
        headers: {
          'Accept': 'application/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        const xmlText = await response.text();
        const parsed = parseYouTubeTranscriptXML(xmlText);
        
        if (parsed && parsed.fullText) {
          return {
            success: true,
            transcript: parsed.fullText,
            segments: parsed.segments,
            videoId: videoId,
          };
        }
      }
    } catch (error) {
      console.log('Auto-generated captions method failed');
    }

    // Method 3: Try alternative format
    try {
      const altUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=vtt`;
      const response = await fetch(altUrl, {
        headers: {
          'Accept': 'text/vtt',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        const vttText = await response.text();
        const parsed = parseVTT(vttText);
        
        if (parsed && parsed.fullText) {
          return {
            success: true,
            transcript: parsed.fullText,
            segments: parsed.segments,
            videoId: videoId,
          };
        }
      }
    } catch (error) {
      console.log('VTT format method failed');
    }

    return {
      success: false,
      error: 'Transcript not available. The video may not have captions enabled, or they may not be available in the requested language.',
      videoId: videoId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to extract transcript',
      videoId: videoId,
    };
  }
}

/**
 * Parse YouTube transcript XML format
 */
function parseYouTubeTranscriptXML(xmlText: string): {
  fullText: string;
  segments: Array<{ text: string; start: number; duration: number }>;
} | null {
  try {
    // Simple XML parsing for transcript
    const textMatches = xmlText.matchAll(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g);
    const segments: Array<{ text: string; start: number; duration: number }> = [];
    const fullTextParts: string[] = [];

    for (const match of textMatches) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = match[3].replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .trim();

      if (text) {
        segments.push({ text, start, duration });
        fullTextParts.push(text);
      }
    }

    if (fullTextParts.length === 0) {
      return null;
    }

    return {
      fullText: fullTextParts.join(' '),
      segments,
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

/**
 * Parse WebVTT format
 */
function parseVTT(vttText: string): {
  fullText: string;
  segments: Array<{ text: string; start: number; duration: number }>;
} | null {
  try {
    const lines = vttText.split('\n');
    const segments: Array<{ text: string; start: number; duration: number }> = [];
    const fullTextParts: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match timestamp line: 00:00:10.000 --> 00:00:15.000
      const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      
      if (timeMatch) {
        const startHours = parseInt(timeMatch[1]);
        const startMinutes = parseInt(timeMatch[2]);
        const startSeconds = parseInt(timeMatch[3]);
        const startMs = parseInt(timeMatch[4]);
        const endHours = parseInt(timeMatch[5]);
        const endMinutes = parseInt(timeMatch[6]);
        const endSeconds = parseInt(timeMatch[7]);
        const endMs = parseInt(timeMatch[8]);

        const start = startHours * 3600 + startMinutes * 60 + startSeconds + startMs / 1000;
        const end = endHours * 3600 + endMinutes * 60 + endSeconds + endMs / 1000;
        const duration = end - start;

        // Get the text on the next line
        if (i + 1 < lines.length) {
          const text = lines[i + 1].trim();
          if (text && !text.startsWith('<') && !text.match(/^\d+$/)) {
            segments.push({ text, start, duration });
            fullTextParts.push(text);
          }
        }
      }
    }

    if (fullTextParts.length === 0) {
      return null;
    }

    return {
      fullText: fullTextParts.join(' '),
      segments,
    };
  } catch (error) {
    console.error('Error parsing VTT:', error);
    return null;
  }
}
