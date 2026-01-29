import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function generateImagePrompts(transcriptLines: Array<{ text: string; startTime: number; endTime: number }>): Promise<string[]> {
  try {
    const scriptText = transcriptLines.map(line => line.text).join(' ');

    const prompt = `You are an expert at creating image generation prompts for video overlays. Given a script, suggest 3 simple, visual image prompts that would enhance the video at key moments.

Script: "${scriptText}"

For each of these ${transcriptLines.length} moments in the script, suggest ONE short, visual image prompt (max 10 words) that represents the key idea:

${transcriptLines.map((line, i) => `${i + 1}. [${Math.floor(line.startTime)}s] "${line.text}"`).join('\n')}

Rules:
- Make prompts SHORT and VISUAL (e.g., "illegal sign", "zen workspace", "beach laptop")
- Focus on OBJECTS, SYMBOLS, or SCENES - not abstract concepts
- Make them SIMPLE and easy to visualize
- Avoid text or words in the image prompts
- Think like an emoji - what ONE visual represents this moment?

Respond with ONLY the image prompts, one per line, numbered 1-${transcriptLines.length}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating concise, visual image generation prompts. Always respond with simple, visual concepts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the numbered list
    const lines = content.split('\n').filter(line => line.trim());
    const prompts = lines.map(line => {
      // Remove number prefix like "1. " or "1) "
      return line.replace(/^\d+[\.\)]\s*/, '').trim();
    });

    // Ensure we have exactly the right number of prompts
    if (prompts.length < transcriptLines.length) {
      // Fill in missing prompts with generic ones
      while (prompts.length < transcriptLines.length) {
        prompts.push('abstract geometric pattern');
      }
    }

    return prompts.slice(0, transcriptLines.length);
  } catch (error) {
    console.error('Error generating image prompts:', error);
    // Fallback to simple prompts based on text
    return transcriptLines.map(line => {
      const text = line.text.slice(0, 60);
      return `visual representation of: ${text}`;
    });
  }
}
