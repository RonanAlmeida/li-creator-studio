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
];

export const DEFAULT_BACKGROUND_MUSIC = BACKGROUND_MUSIC_TRACKS[0]; // None
