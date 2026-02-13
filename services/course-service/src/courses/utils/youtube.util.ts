import { YoutubeTranscript } from 'youtube-transcript-api';

/**
 * Extract YouTube video ID from multiple URL formats
 */
export function extractYoutubeVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getYoutubeTranscript(
  videoId: string,
): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error('Transcript fetch failed:', error.message);
    return null;
  }
}

