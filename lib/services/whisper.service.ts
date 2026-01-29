import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

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

  try {
    // Use form-data with axios (better multipart handling)
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath), {
      filename: path.basename(audioPath),
      contentType: 'audio/mpeg',
    });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'srt');

    // Make API call using axios
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders(),
        },
        responseType: 'text',
      }
    );

    const transcription = response.data;

    // Parse SRT to extract segments
    const segments = parseSRT(transcription);

    // Re-segment into 3-word chunks for better readability
    const chunkedSRT = createChunkedSRT(segments);

    // Save re-chunked SRT file
    const transcriptDir = path.join(process.cwd(), 'public', 'generated-videos', 'transcripts');
    const srtPath = path.join(transcriptDir, `${jobId}.srt`);

    // Ensure directory exists
    if (!fs.existsSync(transcriptDir)) {
      fs.mkdirSync(transcriptDir, { recursive: true });
    }

    // Write chunked SRT content to file
    fs.writeFileSync(srtPath, chunkedSRT);

    console.log(`[Whisper] Transcription saved to ${srtPath} (3 words per caption)`);

    // Parse the chunked SRT
    const finalSegments = parseSRT(chunkedSRT);

    return {
      srtPath,
      segments: finalSegments,
    };
  } catch (error) {
    console.error('[Whisper] Error transcribing audio:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Re-chunk segments into 3-word captions
 */
function createChunkedSRT(segments: TranscriptSegment[]): string {
  const chunks: { start: number; end: number; text: string }[] = [];
  let chunkIndex = 1;

  segments.forEach((segment) => {
    const words = segment.text.trim().split(/\s+/);
    const totalWords = words.length;
    const segmentDuration = segment.end - segment.start;
    const timePerWord = segmentDuration / totalWords;

    // Split into 3-word chunks
    for (let i = 0; i < totalWords; i += 3) {
      const chunkWords = words.slice(i, i + 3);
      const chunkStart = segment.start + (i * timePerWord);
      const chunkEnd = segment.start + ((i + chunkWords.length) * timePerWord);

      chunks.push({
        start: chunkStart,
        end: chunkEnd,
        text: chunkWords.join(' '),
      });
    }
  });

  // Build SRT format
  let srtOutput = '';
  chunks.forEach((chunk, index) => {
    srtOutput += `${index + 1}\n`;
    srtOutput += `${formatSRTTime(chunk.start)} --> ${formatSRTTime(chunk.end)}\n`;
    srtOutput += `${chunk.text}\n\n`;
  });

  return srtOutput;
}

/**
 * Format seconds to SRT timestamp (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
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
