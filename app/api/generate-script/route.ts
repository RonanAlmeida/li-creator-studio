import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userInput, masterPrompt } = await request.json();

    // Use API key from environment variable
    const apiKey = process.env.OPEN_AI_API_KEY;

    if (!apiKey) {
      console.error('OPEN_AI_API_KEY not found in environment variables');
      return NextResponse.json(
        {
          error: 'API Keys Not Configured\n\nPlease add the following API keys to your .env file:\n\n- OPEN_AI_API_KEY (AI script generation)\n- GEMINI_API_KEY (Image generation with Gemini)\n- FAL_KEY (Video generation with Fal.ai)\n\nGet your keys:\n- OpenAI: https://platform.openai.com/api-keys\n- Gemini: https://makersuite.google.com/app/apikey\n- Fal.ai: https://fal.ai/dashboard/keys'
        },
        { status: 500 }
      );
    }

    if (!userInput) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    console.log('Calling OpenAI API with input:', userInput.substring(0, 100));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: masterPrompt,
          },
          {
            role: 'user',
            content: userInput,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return NextResponse.json(
        { error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    const generatedScript = data.choices[0]?.message?.content || '';

    console.log('Sending script back to client');
    return NextResponse.json({ script: generatedScript });
  } catch (error) {
    console.error('Error in generate-script API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
