import { YoutubeTranscript } from "youtube-transcript";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type TranscriptResult =
  | { success: true; text: string; language: string }
  | { success: false; reason: "no_captions" | "network_error" | "invalid_id"; message: string };

// ─────────────────────────────────────────────
// Extract Video ID
// ─────────────────────────────────────────────

/**
 * Extracts YouTube video ID from:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/live/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 * - Raw 11-char video ID passed directly
 */
export function extractYoutubeVideoId(input: string): string | null {
  if (!input?.trim()) return null;

  // Already a raw video ID (11 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = input.match(regex);
  return match ? match[1] : null;
}

// ─────────────────────────────────────────────
// Fetch Transcript
// ─────────────────────────────────────────────

const LANGUAGE_PRIORITY = ["en", "en-US", "en-GB", "en-AU"];

/**
 * Fetch YouTube transcript by video ID or full URL.
 * Returns a typed result — never throws.
 */
export async function getYoutubeTranscript(
  videoIdOrUrl: string
): Promise<TranscriptResult> {
  // ✅ Accept both raw ID and full URL
  const videoId = extractYoutubeVideoId(videoIdOrUrl);

  if (!videoId) {
    return {
      success: false,
      reason: "invalid_id",
      message: `Could not extract a valid video ID from: "${videoIdOrUrl}"`,
    };
  }

  console.log(`📺 Fetching transcript for videoId: ${videoId}`);

  // ✅ Try preferred languages in order, then fall back to any available
  const languagesToTry = [...LANGUAGE_PRIORITY, undefined]; // undefined = auto/any

  for (const lang of languagesToTry) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang,
      });

      if (!transcript || transcript.length === 0) continue;

      const fullText = cleanTranscriptText(transcript.map((t) => t.text));

      console.log(
        `✅ Transcript fetched — lang: ${lang ?? "auto"}, length: ${fullText.length} chars`
      );

      return {
        success: true,
        text: fullText,
        language: lang ?? "auto",
      };
    } catch (err: any) {
      const isNoCaption =
        err.message?.includes("Could not find") ||
        err.message?.includes("disabled") ||
        err.message?.includes("No transcript");

      // Only return hard failure on last attempt
      if (lang === undefined) {
        return {
          success: false,
          reason: isNoCaption ? "no_captions" : "network_error",
          message: err.message,
        };
      }

      // Otherwise try next language silently
      continue;
    }
  }

  return {
    success: false,
    reason: "no_captions",
    message: "No transcript available in any supported language.",
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Joins transcript chunks and cleans up common issues:
 * - Collapses multiple spaces
 * - Fixes missing space before capital letters (new sentences)
 * - Removes HTML entities like &#39;
 */
function cleanTranscriptText(chunks: string[]): string {
  return chunks
    .join(" ")
    .replace(/&#\d+;/g, (match) => {
      // Decode basic HTML entities
      const code = parseInt(match.replace(/[&#;]/g, ""), 10);
      return String.fromCharCode(code);
    })
    .replace(/\s+/g, " ")           // collapse whitespace
    .replace(/([a-z])([A-Z])/g, "$1 $2") // fix missing spaces between sentences
    .trim();
}