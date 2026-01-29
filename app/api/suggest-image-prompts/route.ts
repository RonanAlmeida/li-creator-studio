import { NextRequest, NextResponse } from 'next/server';
import { generateImagePrompts } from '@/lib/services/image-prompt.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcriptLines } = body;

    if (!transcriptLines || !Array.isArray(transcriptLines)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transcriptLines provided' },
        { status: 400 }
      );
    }

    const prompts = await generateImagePrompts(transcriptLines);

    return NextResponse.json({
      success: true,
      prompts,
    });
  } catch (error) {
    console.error('Error in suggest-image-prompts API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
