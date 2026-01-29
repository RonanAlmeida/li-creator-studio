import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AudioGenerationResult {
  audioPath: string;
  duration: number;
}

/**
 * Generate audio from text using ElevenLabs text-to-speech
 */
export async function generateAudioFromText(
  text: string,
  jobId: string,
  voiceId: string = 'VR6AewLTigWG4xSOukaG' // Default to Arnold
): Promise<AudioGenerationResult> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVEN_LABS_API_KEY not configured');
  }

  console.log(`[ElevenLabs] Generating audio for job ${jobId} with voice ${voiceId}`);

  const client = new ElevenLabsClient({ apiKey });

  try {
    // Generate audio stream
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    });

    // Save audio to file
    const audioDir = path.join(process.cwd(), 'public', 'generated-videos', 'audio');
    const audioPath = path.join(audioDir, `${jobId}.mp3`);

    // Ensure directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Write stream to file
    const writeStream = fs.createWriteStream(audioPath);

    // Convert ReadableStream to Node.js stream and pipe
    const reader = audioStream.getReader();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writeStream.write(value);
      }
      writeStream.end();
    };

    await pump();

    // Wait for write to complete
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    console.log(`[ElevenLabs] Audio saved to ${audioPath}`);

    // Get audio duration using ffprobe
    const duration = await getAudioDuration(audioPath);

    return {
      audioPath,
      duration,
    };
  } catch (error) {
    console.error('[ElevenLabs] Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get audio duration in seconds using ffprobe
 */
async function getAudioDuration(audioPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.warn('[ElevenLabs] Could not get audio duration, using default');
    return 0;
  }
}
