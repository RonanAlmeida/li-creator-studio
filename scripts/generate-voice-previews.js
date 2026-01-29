const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

const PREVIEW_TEXT = "I'm Thor Odinson from JeESoba";

const VOICES = [
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'sam' },
];

async function generatePreviews() {
  const apiKey = process.env.ELEVEN_LABS_API_KEY || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('❌ ELEVEN_LABS_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('🎙️  Generating voice previews...\n');

  const client = new ElevenLabsClient({ apiKey });

  // Create previews directory
  const previewDir = path.join(process.cwd(), 'public', 'voice-previews');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  for (const voice of VOICES) {
    try {
      console.log(`Generating preview for ${voice.name}...`);

      const audioStream = await client.textToSpeech.convert(voice.id, {
        text: PREVIEW_TEXT,
        modelId: 'eleven_multilingual_v2',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
        },
      });

      const outputPath = path.join(previewDir, `${voice.name}.mp3`);
      const writeStream = fs.createWriteStream(outputPath);

      // Convert ReadableStream to Node.js stream
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

      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
      });

      console.log(`✅ ${voice.name}.mp3 generated successfully`);
    } catch (error) {
      console.error(`❌ Failed to generate ${voice.name}:`, error.message);
    }
  }

  console.log('\n🎉 All voice previews generated!');
  console.log('📁 Location: public/voice-previews/');
}

generatePreviews().catch(console.error);
