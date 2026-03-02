import YTDlpWrap from "yt-dlp-wrap-extended";
import path from "path";
import fs from "fs";

const BIN_PATH = path.join(process.cwd(), "bin", "yt-dlp");

let ytDlpInstance: YTDlpWrap | null = null;

/**
 * Downloads yt-dlp binary once, reuses it after
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getYtDlp(): Promise<YTDlpWrap> {
  if (ytDlpInstance) return ytDlpInstance;

  if (!fs.existsSync(BIN_PATH)) {
    fs.mkdirSync(path.dirname(BIN_PATH), { recursive: true });
    console.log("[yt-dlp] Binary not found, downloading from GitHub...");
    await YTDlpWrap.downloadFromGithub(BIN_PATH);

    // ✅ Windows holds a file lock briefly after writing — wait for release
    await sleep(2000);
    console.log("[yt-dlp] Binary ready at:", BIN_PATH);
  }

  ytDlpInstance = new YTDlpWrap(BIN_PATH);
  return ytDlpInstance;
}

/**
 * Download YouTube audio to a local temp file using yt-dlp.
 * Returns the file path — caller is responsible for cleanup.
 */
export async function downloadYoutubeAudio(url: string): Promise<string> {
  const ytDlp = await getYtDlp();
  const filePath = path.join(process.cwd(), "tmp", `audio-${Date.now()}.mp3`);

  // ensure tmp dir exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  await ytDlp.execPromise([
    url,
    "-f", "bestaudio",
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "0",
    "-o", filePath,
    "--no-playlist",
    "--quiet",
  ]);

  if (!fs.existsSync(filePath)) {
    throw new Error(`yt-dlp finished but output file not found: ${filePath}`);
  }

  return filePath;
}
