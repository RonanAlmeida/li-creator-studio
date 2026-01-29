import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { CaptionOptions } from '@/types';

/**
 * Overlay subtitles on video using ffmpeg
 */
export async function overlaySubtitles(
  videoPath: string,
  srtPath: string,
  captionOptions: CaptionOptions,
  outputPath: string
): Promise<string> {
  console.log(`[ffmpeg] Overlaying captions on video`);
  console.log(`[ffmpeg] Input video: ${videoPath}`);
  console.log(`[ffmpeg] SRT file: ${srtPath}`);
  console.log(`[ffmpeg] Output: ${outputPath}`);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build subtitle style string for ffmpeg
  const subtitleStyle = buildSubtitleStyle(captionOptions);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf',
        `subtitles=${srtPath}:force_style='${subtitleStyle}'`,
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log(`[ffmpeg] Command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[ffmpeg] Processing: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`[ffmpeg] Caption overlay complete: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`[ffmpeg] Error:`, err);
        reject(new Error(`ffmpeg failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * Build ffmpeg subtitle style string from CaptionOptions
 */
export function buildSubtitleStyle(options: CaptionOptions): string {
  const styles: string[] = [];

  // Font family
  if (options.fontFamily) {
    const fontName = options.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    styles.push(`FontName=${fontName}`);
  }

  // Font size
  if (options.size) {
    styles.push(`FontSize=${options.size}`);
  }

  // Text color (convert hex to ASS format)
  if (options.color) {
    const assColor = hexToASSColor(options.color);
    styles.push(`PrimaryColour=${assColor}`);
  }

  // Outline color (for text shadow/outline)
  styles.push(`OutlineColour=&H000000&`); // Black outline
  styles.push(`Outline=2`); // Outline thickness
  styles.push(`Shadow=1`); // Shadow depth

  // Text weight based on style
  if (options.style === 'bold') {
    styles.push(`Bold=1`);
  } else if (options.style === 'minimal') {
    styles.push(`Bold=0`);
  }

  // Text alignment based on position
  const alignment = positionToAlignment(options.position);
  styles.push(`Alignment=${alignment}`);

  // Margins (distance from edge)
  if (options.position === 'bottom') {
    styles.push(`MarginV=40`); // 40px from bottom
  } else if (options.position === 'top') {
    styles.push(`MarginV=40`); // 40px from top
  } else {
    styles.push(`MarginV=0`); // Center
  }

  return styles.join(',');
}

/**
 * Convert hex color to ASS format
 * Hex: #RRGGBB -> ASS: &HBBGGRR& (BGR with alpha)
 */
function hexToASSColor(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB
  const r = hex.substring(0, 2);
  const g = hex.substring(2, 4);
  const b = hex.substring(4, 6);

  // Convert to BGR format with alpha channel (FF = fully opaque)
  return `&H00${b}${g}${r}&`;
}

/**
 * Convert caption position to ASS alignment number
 * ASS Alignment (numpad layout):
 * 7 8 9 (top)
 * 4 5 6 (middle)
 * 1 2 3 (bottom)
 */
function positionToAlignment(position: 'top' | 'center' | 'bottom'): number {
  switch (position) {
    case 'top':
      return 8; // Top center
    case 'center':
      return 5; // Middle center
    case 'bottom':
      return 2; // Bottom center
    default:
      return 2;
  }
}

/**
 * Create a simple SRT file for testing purposes
 */
export function createTestSRT(text: string, duration: number, outputPath: string): void {
  const srtContent = `1
00:00:00,000 --> ${formatSRTTimestamp(duration)}
${text}
`;

  fs.writeFileSync(outputPath, srtContent);
  console.log(`[ffmpeg] Test SRT created: ${outputPath}`);
}

/**
 * Format seconds to SRT timestamp format (HH:MM:SS,mmm)
 */
function formatSRTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}
