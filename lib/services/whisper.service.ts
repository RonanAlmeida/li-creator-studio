import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  srtPath: string;
  segments: TranscriptSegment[];
}

/**
 * Transcribe audio using OpenAI Whisper
 */
export async function transcribeAudio(
  audioPath: string,
  jobId: string
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPEN_AI_API_KEY;

  if (!apiKey) {
    throw new Error('OPEN_AI_API_KEY not configured');
  }

  console.log(`[Whisper] Transcribing audio for job ${jobId}`);

  const client = new OpenAI({ apiKey });

  try {
    // Create read stream from audio file
    const audioFile = fs.createReadStream(audioPath);

    // Transcribe audio to SRT format (includes timestamps)
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'srt',
    });

    // Save SRT file
    const transcriptDir = path.join(process.cwd(), 'public', 'generated-videos', 'transcripts');
    const srtPath = path.join(transcriptDir, `${jobId}.srt`);

    // Ensure directory exists
    if (!fs.existsSync(transcriptDir)) {
      fs.mkdirSync(transcriptDir, { recursive: true });
    }

    // Write SRT content to file
    fs.writeFileSync(srtPath, transcription);

    console.log(`[Whisper] Transcription saved to ${srtPath}`);

    // Parse SRT to extract segments
    const segments = parseSRT(transcription);

    return {
      srtPath,
      segments,
    };
  } catch (error) {
    console.error('[Whisper] Error transcribing audio:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse SRT format to extract segments with timestamps
 */
function parseSRT(srt: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const blocks = srt.trim().split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    // Parse timestamp line (e.g., "00:00:00,000 --> 00:00:03,000")
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const start = timeToSeconds(timeMatch[1]);
    const end = timeToSeconds(timeMatch[2]);
    const text = lines.slice(2).join(' ').trim();

    segments.push({ start, end, text });
  }

  return segments;
}

/**
 * Convert SRT timestamp to seconds
 * Format: HH:MM:SS,mmm
 */
function timeToSeconds(time: string): number {
  const parts = time.replace(',', '.').split(':');
  const hours = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}
