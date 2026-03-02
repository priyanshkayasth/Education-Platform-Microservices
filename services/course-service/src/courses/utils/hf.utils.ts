// import axios from "axios";
// import fs from "fs";
// import path from "path";
// import YTDlpWrap from "yt-dlp-wrap-extended";

// // ─────────────────────────────────────────────
// // yt-dlp setup
// // ─────────────────────────────────────────────

// const BIN_PATH = path.join(
//   process.cwd(),
//   "bin",
//   process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
// );let ytDlpInstance: YTDlpWrap | null = null;

// async function getYtDlp(): Promise<YTDlpWrap> {
//   if (ytDlpInstance) return ytDlpInstance;

//   if (!fs.existsSync(BIN_PATH)) {
//     fs.mkdirSync(path.dirname(BIN_PATH), { recursive: true });
//     console.log("[yt-dlp] Binary not found, downloading from GitHub...");
//     await YTDlpWrap.downloadFromGithub(BIN_PATH);
//     console.log("[yt-dlp] Binary ready at:", BIN_PATH);
//   }

//   ytDlpInstance = new YTDlpWrap(BIN_PATH);
//   return ytDlpInstance;
// }

// // ─────────────────────────────────────────────
// // HuggingFace setup
// // ─────────────────────────────────────────────

// const HF_BASE = "https://router.huggingface.co/hf-inference/models";

// function getHFKey(): string {
//   const key = process.env.HF_API_KEY;
//   if (!key) throw new Error("HF_API_KEY missing in env");
//   return key;
// }

// // ─────────────────────────────────────────────
// // Download
// // ─────────────────────────────────────────────

// /**
//  * Download YouTube audio to a local temp file using yt-dlp.
//  * Returns the file path — caller is responsible for cleanup.
//  */
// export async function downloadYoutubeAudio(url: string): Promise<string> {
//   const ytDlp = await getYtDlp();
//   const filePath = path.join(process.cwd(), "tmp", `audio-${Date.now()}.mp3`);

//   // ensure tmp dir exists
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });

//   await ytDlp.execPromise([
//     url,
//     "-f", "bestaudio",
//     "-x",                       // extract audio only
//     "--audio-format", "mp3",
//     "--audio-quality", "0",     // best quality
//     "-o", filePath,
//     "--no-playlist",
//     "--quiet",
//   ]);

//   if (!fs.existsSync(filePath)) {
//     throw new Error(`yt-dlp finished but output file not found: ${filePath}`);
//   }

//   return filePath;
// }

// // ─────────────────────────────────────────────
// // Transcribe
// // ─────────────────────────────────────────────

// /**
//  * Transcribe audio using HuggingFace Whisper.
//  * Automatically deletes the temp file after transcription.
//  */
// export async function transcribeWithHF(filePath: string): Promise<string> {
//   try {
//     const audio = fs.readFileSync(filePath);

//     const res = await axios.post(
//       `${HF_BASE}/openai/whisper-small`,
//       audio,
//       {
//         headers: {
//           Authorization: `Bearer ${getHFKey()}`,
//           "Content-Type": "audio/mpeg",
//         },
//         maxBodyLength: Infinity,
//         timeout: 120_000, // HF cold-start can be slow
//       }
//     );

//     if (!res.data?.text) {
//       throw new Error("Whisper returned no text in response");
//     }

//     return res.data.text as string;
//   } finally {
//     // Always clean up the temp audio file
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   }
// }

// // ─────────────────────────────────────────────
// // Summarize
// // ─────────────────────────────────────────────

// /**
//  * Summarize text using HuggingFace BART.
//  */
// export async function summarizeWithHF(text: string): Promise<string> {
//   // BART-large-cnn max input is ~1024 tokens (~4000 chars)
//   const truncated = text.length > 4000 ? text.slice(0, 4000) : text;

//   const res = await axios.post(
//     `${HF_BASE}/facebook/bart-large-cnn`,
//     {
//       inputs: truncated,
//       parameters: {
//         max_length: 200,
//         min_length: 50,
//         do_sample: false,
//       },
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${getHFKey()}`,
//       },
//       timeout: 60_000,
//     }
//   );

//   if (!res.data?.[0]?.summary_text) {
//     throw new Error("BART returned no summary in response");
//   }

//   return res.data[0].summary_text as string;
// }

// // ─────────────────────────────────────────────
// // Convenience
// // ─────────────────────────────────────────────

// /**
//  * Download → transcribe → summarize in one call.
//  * Audio file is cleaned up automatically inside transcribeWithHF.
//  */
// export async function summarizeYoutubeVideo(url: string): Promise<{
//   transcript: string;
//   summary: string;
// }> {
//   const audioPath = await downloadYoutubeAudio(url);
//   const transcript = await transcribeWithHF(audioPath); // cleans up file
//   const summary = await summarizeWithHF(transcript);
//   return { transcript, summary };
// }