import { NextRequest, NextResponse } from 'next/server';
import { generateAudioFromText } from '@/lib/services/elevenlabs.service';
import { transcribeAudio } from '@/lib/services/whisper.service';
import { generateJobId } from '@/lib/services/pipeline.service';
import fs from 'fs';

/**
 * POST /api/audio/transcribe
 * Generate audio and transcribe it to get accurate timestamps
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    console.log(`[API] Starting audio transcription: ${jobId}`);

    // Step 1: Generate audio
    console.log('[API] Generating audio...');
    const { audioPath, duration } = await generateAudioFromText(text, jobId, voiceId);

    // Step 2: Transcribe with Whisper
    console.log('[API] Transcribing audio...');
    const { srtPath, transcript } = await transcribeAudio(audioPath, jobId);

    // Parse SRT to get transcript lines with timestamps
    const srtContent = fs.readFileSync(srtPath, 'utf-8');
    const transcriptLines = parseSRT(srtContent);

    console.log(`[API] Transcription complete with ${transcriptLines.length} lines`);

    return NextResponse.json({
      success: true,
      jobId,
      duration,
      audioPath,
      srtPath,
      transcriptLines,
    });
  } catch (error) {
    console.error('[API] Audio transcription failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      },
      { status: 500 }
    );
  }
}

interface TranscriptLine {
  text: string;
  startTime: number;
  endTime: number;
}

function parseSRT(srtContent: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const blocks = srtContent.trim().split('\n\n');

  for (const block of blocks) {
    const blockLines = block.split('\n');
    if (blockLines.length < 3) continue;

    // Line 2 is the timestamp (00:00:01,000 --> 00:00:03,000)
    const timestampLine = blockLines[1];
    const match = timestampLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (match) {
      const startTime = parseTimestamp(match[1], match[2], match[3], match[4]);
      const endTime = parseTimestamp(match[5], match[6], match[7], match[8]);
      const text = blockLines.slice(2).join(' ').trim();

      lines.push({ text, startTime, endTime });
    }
  }

  return lines;
}

function parseTimestamp(hours: string, minutes: string, seconds: string, milliseconds: string): number {
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(milliseconds) / 1000
  );
}
