export interface Voice {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  category: 'male' | 'female' | 'neutral';
}

export const ELEVENLABS_VOICES: Voice[] = [
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Crisp, professional voice',
    previewUrl: '/voice-previews/arnold.mp3',
    category: 'male',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    description: 'Well-rounded, smooth voice',
    previewUrl: '/voice-previews/antoni.mp3',
    category: 'male',
  },
  {
    id: 'TWUKKXAylkYxxlPe4gx0',
    name: 'Armando',
    description: 'Realistic, expressive voice',
    previewUrl: '/voice-previews/armando.mp3',
    category: 'male',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Young, energetic voice',
    previewUrl: '/voice-previews/josh.mp3',
    category: 'male',
  },
  {
    id: 'Ifu36BnEjjIY932etsqk',
    name: 'Nate',
    description: 'Natural, warm podcast voice',
    previewUrl: '/voice-previews/nate.mp3',
    category: 'male',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    description: 'Raspy, edgy voice',
    previewUrl: '/voice-previews/sam.mp3',
    category: 'male',
  },
];

export const DEFAULT_VOICE = ELEVENLABS_VOICES[0]; // Arnold
