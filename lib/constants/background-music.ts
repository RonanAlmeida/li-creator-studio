export interface BackgroundMusic {
  id: string;
  name: string;
  description: string;
  filename: string;
  duration?: number;
}

export const BACKGROUND_MUSIC_TRACKS: BackgroundMusic[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No background music',
    filename: '',
  },
  {
    id: 'lofi-waterfall',
    name: 'Lofi Waterfall',
    description: 'Relaxing lofi with waterfall sounds',
    filename: 'lofi-waterfall.mp3',
    duration: 60,
  },
  {
    id: 'corporate-upbeat',
    name: 'Corporate Upbeat',
    description: 'Energetic and professional',
    filename: 'corporate-upbeat.mp3',
    duration: 45,
  },
  {
    id: 'ambient-tech',
    name: 'Ambient Tech',
    description: 'Modern tech vibes with subtle synths',
    filename: 'ambient-tech.mp3',
    duration: 50,
  },
  {
    id: 'inspiring-piano',
    name: 'Inspiring Piano',
    description: 'Motivational piano melody',
    filename: 'inspiring-piano.mp3',
    duration: 55,
  },
];

export const DEFAULT_BACKGROUND_MUSIC = BACKGROUND_MUSIC_TRACKS[0]; // None
